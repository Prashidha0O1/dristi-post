export const currencyToCountry: Record<string, string> = {
  INR: "in", USD: "us", EUR: "eu", GBP: "gb", CHF: "ch",
  AUD: "au", CAD: "ca", SGD: "sg", JPY: "jp", CNY: "cn",
  SAR: "sa", QAR: "qa", THB: "th", AED: "ae", MYR: "my",
  KRW: "kr", SEK: "se", DKK: "dk", HKD: "hk", KWD: "kw",
  BHD: "bh", OMR: "om"
};

export function getFlagUrl(iso3: string) {
  const country = currencyToCountry[iso3];
  return country ? `https://flagcdn.com/w20/${country}.png` : null;
}
