import type { AdQuery, AdRecord, AdUpdateInput, NewAdInput } from "../domain/ad";
import type { Paginated } from "../domain/article";
import type { AdRepository, Clock, IdGenerator } from "../domain/ports";
import type { AdPlacement } from "../adSlots";
import { adPlacements } from "../adSlots";
import { NotFoundError, validateAdUpdate, validateNewAd } from "./validation";

/**
 * Advertisement use cases. Grouped in one module like the job ones, since each
 * is only a few lines and they always change together. Depend on ports only —
 * never on a database client or `Date`.
 */

export class CreateAd {
  constructor(
    private readonly ads: AdRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: NewAdInput): Promise<AdRecord> {
    validateNewAd(input);

    const now = this.clock.now().toISOString();

    const ad: AdRecord = {
      id: this.ids.generate(),
      placement: input.placement,
      imageUrl: input.imageUrl.trim(),
      linkUrl: input.linkUrl.trim(),
      altText: input.altText.trim(),
      isActive: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.ads.save(ad);

    // Activating goes through SetAdActive rather than being inlined here, so
    // the "only one live per slot" rule lives in exactly one place.
    if (input.activate) {
      return new SetAdActive(this.ads, this.clock).activate(ad.id);
    }

    return ad;
  }
}

export class UpdateAd {
  constructor(
    private readonly ads: AdRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: string, changes: AdUpdateInput): Promise<AdRecord> {
    validateAdUpdate(changes);

    const existing = await this.ads.findById(id);
    if (!existing) throw new NotFoundError(`Ad "${id}" not found`);

    const updated: AdRecord = {
      ...existing,
      ...changes,
      updatedAt: this.clock.now().toISOString(),
    };

    await this.ads.save(updated);

    // Moving a live ad to a different slot would otherwise leave two ads active
    // in the destination. Re-running activation re-applies the exclusivity.
    if (updated.isActive && changes.placement && changes.placement !== existing.placement) {
      return new SetAdActive(this.ads, this.clock).activate(id);
    }

    return updated;
  }
}

export class SetAdActive {
  constructor(
    private readonly ads: AdRepository,
    private readonly clock: Clock,
  ) {}

  /**
   * Makes this ad the live one for its slot, standing down whatever was there.
   *
   * The Supabase JS client has no multi-statement transaction, so this is a
   * sequence of writes: the incumbent is deactivated first, then this ad is
   * activated. A crash between the two leaves the slot **empty** rather than
   * double-filled — the safe direction, since an empty slot falls back to the
   * grey placeholder while two active ads would break the unique index the
   * migration puts on (placement) WHERE isActive.
   */
  async activate(id: string): Promise<AdRecord> {
    const ad = await this.require(id);
    const now = this.clock.now().toISOString();

    const incumbent = await this.ads.findActiveByPlacement(ad.placement);
    if (incumbent && incumbent.id !== ad.id) {
      await this.ads.save({ ...incumbent, isActive: false, updatedAt: now });
    }

    const updated: AdRecord = { ...ad, isActive: true, updatedAt: now };
    await this.ads.save(updated);
    return updated;
  }

  async deactivate(id: string): Promise<AdRecord> {
    const ad = await this.require(id);
    const updated: AdRecord = {
      ...ad,
      isActive: false,
      updatedAt: this.clock.now().toISOString(),
    };
    await this.ads.save(updated);
    return updated;
  }

  private async require(id: string): Promise<AdRecord> {
    const ad = await this.ads.findById(id);
    if (!ad) throw new NotFoundError(`Ad "${id}" not found`);
    return ad;
  }
}

export class DeleteAd {
  constructor(private readonly ads: AdRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.ads.findById(id);
    if (!existing) throw new NotFoundError(`Ad "${id}" not found`);
    await this.ads.delete(id);
  }
}

/** Lists ads for the admin console, where dormant ones are visible. */
export class ListAds {
  constructor(private readonly ads: AdRepository) {}

  execute(query: AdQuery = {}): Promise<Paginated<AdRecord>> {
    return this.ads.list(query);
  }
}

/**
 * The live ad for every slot, for the public site.
 *
 * Returns a full record keyed by placement — including the slots with nothing
 * in them — so a caller can render all five positions from one lookup instead
 * of five, and an unsold slot is an explicit `null` rather than a missing key.
 */
export class GetActiveAds {
  constructor(private readonly ads: AdRepository) {}

  async execute(): Promise<Record<AdPlacement, AdRecord | null>> {
    const found = await Promise.all(
      adPlacements.map(async (placement) => {
        const ad = await this.ads.findActiveByPlacement(placement);
        // Belt and braces: the repository filters on isActive, but this is the
        // public path, so the guarantee is restated here rather than trusted.
        return [placement, ad && ad.isActive ? ad : null] as const;
      }),
    );

    return Object.fromEntries(found) as Record<AdPlacement, AdRecord | null>;
  }
}
