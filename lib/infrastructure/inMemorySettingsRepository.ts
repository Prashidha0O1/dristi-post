import type { FooterSettings, SeoSettings, PoliciesSettings, SettingsRepository } from "../domain/settings";

export class InMemorySettingsRepository implements SettingsRepository {
  private footer: FooterSettings = {
    description_ne: "नेपालका समाचार, विचार र उपयोगी जानकारीलाई स्पष्ट र जिम्मेवार ढंगले प्रस्तुत गर्ने डिजिटल न्यूजरुम।",
    description_en: "A digital newsroom presenting Nepal's news, ideas, and useful information with clarity and responsibility.",
    companyRegNo: "",
    mediaRegNo: "",
    email: "",
    phone: "",
    whatsapp: "",
    socialFacebook: "",
    socialX: "",
    socialTiktok: ""
  };

  private seo: SeoSettings = {
    home_title_ne: "दृष्टि टाइम्स | नेपालको भरपर्दो समाचार",
    home_title_en: "Dristi Times | Nepal's Trusted News",
    home_desc_ne: "",
    home_desc_en: "",
    blog_title_ne: "ब्लग",
    blog_title_en: "Blog",
    blog_desc_ne: "",
    blog_desc_en: "",
    pageOverrides: []
  };

  private policies: PoliciesSettings = {
  editorial_ne: `<p>दृष्टि टाइम्स एक स्वतन्त्र डिजिटल न्यूजरुम हो जुन नेपालका समाचार, विचार, र उपयोगी जानकारीहरूलाई पूर्ण स्पष्टता र जिम्मेवारीका साथ प्रस्तुत गर्न समर्पित छ। हाम्रो प्राथमिक प्रतिबद्धता सत्य र नेपालका नागरिकहरूको जनहितप्रति छ।</p><h2>सत्यतथ्य र तथ्य जाँच</h2><p>हामी हाम्रा सबै रिपोर्टिङमा सत्यताका लागि प्रयास गर्छौं। हाम्रा पत्रकारहरूले प्रकाशन गर्नुअघि उनीहरूको तथ्यहरू प्रमाणित गर्न आवश्यक छ। यदि हामीले कुनै त्रुटि गरेमा, हामी त्यसलाई तुरुन्त र पारदर्शी रूपमा सच्याउँछौं।</p><h2>स्वतन्त्रता र निष्पक्षता</h2><p>हाम्रा सम्पादकीय निर्णयहरू व्यावसायिक, राजनीतिक, वा व्यक्तिगत स्वार्थबाट पूर्ण रूपमा स्वतन्त्र हुन्छन्। हामी अनुकुल समाचार कभरेजको सट्टामा कुनै भुक्तानी स्वीकार गर्दैनौं। हाम्रो प्लेटफर्ममा कुनै पनि प्रायोजित सामग्री वा विज्ञापनहरू स्पष्ट रूपमा लेबल गरिएका हुन्छन्।</p><h2>निष्पक्षता र जवाफदेहिता</h2><p>हामी हाम्रो रिपोर्टिङमा निष्पक्ष र सन्तुलित हुने लक्ष्य राख्छौं। जब हाम्रा समाचारहरूमा व्यक्ति वा संस्थाहरू विरुद्ध आरोपहरू समावेश हुन्छन्, हामी उनीहरूलाई सम्पर्क गर्ने र प्रकाशन अघि प्रतिक्रियाको लागि उचित अवसर प्रदान गर्ने प्रयास गर्छौं।</p><h2>गोपनीयता र संवेदनशीलता</h2><p>सत्य समाचार सम्प्रेषण गर्न समर्पित रहँदा हामी व्यक्तिहरूको गोपनीयताको पनि सम्मान गर्छौं। हामी करुणाका साथ रिपोर्ट गर्छौं र अनावश्यक हानि कम गर्ने लक्ष्य राख्छौं।</p>`,
  editorial_en: `<p>Dristi Times is an independent digital newsroom dedicated to presenting Nepal's news, ideas, and useful information with absolute clarity and responsibility. Our primary commitment is to the truth and to the public interest of the people of Nepal.</p><h2>Accuracy and Fact-Checking</h2><p>We strive for accuracy in all our reporting. Our journalists are required to verify their facts before publication. In cases of breaking news where facts are evolving, we clearly state what is known and what is yet to be confirmed. If we make an error, we correct it promptly and transparently.</p><h2>Independence and Impartiality</h2><p>Our editorial decisions are made completely independent of commercial, political, or personal interests. We do not accept payment in exchange for favorable news coverage. Any sponsored content or advertisements on our platform are clearly labeled to distinguish them from independent journalistic work.</p><h2>Fairness and Right of Reply</h2><p>We aim to be fair and balanced in our reporting. When our stories involve accusations or critical claims against individuals or organizations, we make every reasonable effort to contact them and provide a fair opportunity for a response prior to publication.</p><h2>Privacy and Compassion</h2><p>While we are dedicated to reporting the truth, we also respect the privacy of individuals, especially victims of trauma, minors, and those not in the public eye. We report with compassion and aim to minimize unnecessary harm.</p>`,
  privacy_ne: `<p>दृष्टि टाइम्स (dristitimes.com) मा, हाम्रा आगन्तुकहरूको गोपनीयता हाम्रो लागि अत्यन्त महत्त्वपूर्ण छ। यस गोपनीयता नीतिले दृष्टि टाइम्सले कस्तो प्रकारको व्यक्तिगत जानकारी प्राप्त र सङ्कलन गर्छ र यसलाई कसरी प्रयोग गरिन्छ भन्ने कुरालाई रूपरेखा गर्दछ।</p><h2>हामीले सङ्कलन गर्ने जानकारी</h2><p>हामीले हाम्रा सेवाहरू प्रदान गर्न, तपाईंसँग कुराकानी गर्न, वा हाम्रा सेवाहरूलाई अझ राम्रो बनाउनको लागि मात्र तपाईंको जानकारी सङ्कलन गर्छौं। तपाईंले हामीलाई सीधै जानकारी प्रदान गर्दा, वा स्वचालित रूपमा हाम्रा सेवाहरू सञ्चालन गर्दा हामी यो जानकारी सङ्कलन गर्छौं।</p><h2>लग फाइलहरू</h2><p>अन्य धेरै वेब साइटहरू जस्तै, दृष्टि टाइम्सले लग फाइलहरू प्रयोग गर्दछ। लग फाइलहरू भित्रको जानकारीमा इन्टरनेट प्रोटोकल (IP) ठेगानाहरू, ब्राउजरको प्रकार, इन्टरनेट सेवा प्रदायक (ISP), मिति/समय टिकट, र साइट व्यवस्थापन गर्न र प्रवृत्तिहरू विश्लेषण गर्न क्लिकहरूको संख्या समावेश हुन्छ।</p><h2>कुकीहरू (Cookies)</h2><p>दृष्टि टाइम्सले आगन्तुकहरूको प्राथमिकताहरू भण्डारण गर्न कुकीहरूको प्रयोग गर्दछ। यसले आगन्तुकको ब्राउजर प्रकार वा अन्य जानकारीको आधारमा वेब पृष्ठ सामग्री अनुकूलित गर्न मद्दत गर्दछ।</p><h2>सहमति</h2><p>हाम्रो वेबसाइट प्रयोग गरेर, तपाईं यस गोपनीयता नीति र यसका सर्तहरूमा सहमत हुनुहुन्छ। यदि तपाईंलाई कुनै थप जानकारी आवश्यक छ वा हाम्रो गोपनीयता नीतिको बारेमा कुनै प्रश्नहरू छन् भने, कृपया हामीलाई सम्पर्क गर्न नहिचकिचाउनुहोस्।</p>`,
  privacy_en: `<p>At Dristi Times (dristitimes.com), the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information is received and collected by Dristi Times and how it is used.</p><h2>Information We Collect</h2><p>We only collect information about you if we have a reason to do so, for example, to provide our Services, to communicate with you, or to make our Services better. We collect information in three ways: if and when you provide information to us, automatically through operating our Services, and from outside sources.</p><h2>Log Files</h2><p>Like many other Web sites, Dristi Times makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information.</p><h2>Cookies and Web Beacons</h2><p>Dristi Times does use cookies to store information about visitors preferences, record user-specific information on which pages the user access or visit, customize Web page content based on visitors browser type or other information that the visitor sends via their browser.</p><h2>Consent</h2><p>By using our website, you hereby consent to our privacy policy and agree to its terms. If you require any more information or have any questions about our privacy policy, please feel free to contact us.</p>`
};

  async getFooterSettings(): Promise<FooterSettings> {
    return { ...this.footer };
  }

  async getSeoSettings(): Promise<SeoSettings> {
    return { ...this.seo };
  }

  async getPoliciesSettings(): Promise<PoliciesSettings> {
    return { ...this.policies };
  }

  async saveFooterSettings(settings: FooterSettings): Promise<void> {
    this.footer = { ...settings };
  }

  async saveSeoSettings(settings: SeoSettings): Promise<void> {
    this.seo = { ...settings };
  }

  async savePoliciesSettings(settings: PoliciesSettings): Promise<void> {
    this.policies = { ...settings };
  }
}
