import type { GiftAccount, WeddingEvent } from "../config/wedding.config";
import type { InviteMessageTemplate } from "../config/invite-templates";

export type RsvpContent = {
  title?: string;
  subtitle?: string;
  note?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  guestCountLabel?: string;
  guestCountAriaLabel?: string;
  guestCountPlaceholder?: string;
  guestCountOptions?: string[];
  attendanceLabel?: string;
  attendanceAriaLabel?: string;
  submit?: string;
  submitting?: string;
  defaultAttendance?: string;
  errorMessage?: string;
  successMessage?: string;
  alreadySubmittedMessage?: string;
  tooFastMessage?: string;
  spamNameMessage?: string;
  localSuccessMessage?: string;
  networkErrorMessage?: string;
  supabaseErrorMessage?: string;
  listTitle?: string;
  listSubtitle?: string;
  searchPlaceholder?: string;
  emptyList?: string;
  loadError?: string;
  refreshButton?: string;
  exportButton?: string;
  exportSuccess?: string;
  deleteConfirm?: string;
  deletedMessage?: string;
  deleteError?: string;
  filterAll?: string;
  filterHadir?: string;
  filterTidak?: string;
  filterRagu?: string;
  colDate?: string;
  colName?: string;
  colCount?: string;
  colAttendance?: string;
  colGuest?: string;
  colActions?: string;
  attendanceHadir?: string;
  attendanceTidak?: string;
  attendanceRagu?: string;
  statTotal?: string;
  statPeople?: string;
  statHadir?: string;
  statTidak?: string;
  liveUpdateMessage?: string;
};

export type GuestbookContent = {
  title?: string;
  subtitle?: string;
  namePlaceholder?: string;
  messagePlaceholder?: string;
  submit?: string;
  submitting?: string;
  emptyMessage?: string;
  emptyNoSupabase?: string;
  pagerPrev?: string;
  pagerNext?: string;
  errorMessage?: string;
  successMessage?: string;
  localSuccessMessage?: string;
  networkErrorMessage?: string;
  supabaseErrorMessage?: string;
};

export type SiteContentOverrides = {
  site?: {
    title?: string;
    description?: string;
    url?: string;
    noIndex?: boolean;
    creator?: {
      name?: string;
      url?: string;
      websiteUrl?: string;
      instagramUrl?: string;
    };
  };
  couple?: {
    groom?: {
      shortName?: string;
      fullName?: string;
      instagram?: string;
      instagramHandle?: string;
      photo?: string;
    };
    bride?: {
      shortName?: string;
      fullName?: string;
      instagram?: string;
      instagramHandle?: string;
      photo?: string;
    };
  };
  coupleSection?: {
    prefix?: string;
    title?: string;
    connector?: string;
  };
  date?: string;
  dateLabel?: string;
  dateShort?: string;
  location?: string;
  hero?: {
    eyebrow?: string;
    groomName?: string;
    brideName?: string;
  };
  intro?: string;
  quote?: string;
  bibleQuote?: string;
  bibleReference?: string;
  events?: WeddingEvent[];
  eventsSection?: {
    title?: string;
    titleEmbedded?: string;
    subtitle?: string;
    venueLabel?: string;
    venueLabelColon?: string;
    mapsButton?: string;
  };
  gallery?: {
    title?: string;
    subtitle?: string;
    images?: { src: string; alt: string }[];
  };
  gift?: {
    title?: string;
    description?: string;
    physicalAddress?: string;
    accounts?: GiftAccount[];
  };
  giftUi?: {
    openButton?: string;
    bankLabel?: string;
    accountNumberLabel?: string;
    accountHolderPrefix?: string;
    copyAccountButton?: string;
    physicalGiftTitle?: string;
    copyAddressButton?: string;
    copyAccountSuccess?: string;
    copyAddressSuccess?: string;
    copyError?: string;
  };
  hashtag?: {
    title?: string;
    tag?: string;
    photo?: string;
  };
  closing?: {
    paragraphs?: string[];
  };
  cover?: {
    eyebrow?: string;
    salutation?: string;
    openButton?: string;
    openButtonAriaLabel?: string;
    rumahBolonAlt?: string;
  };
  countdown?: {
    title?: string;
    heading?: string;
    labels?: {
      days?: string;
      hours?: string;
      minutes?: string;
      seconds?: string;
    };
  };
  footer?: {
    creditPrefix?: string;
    portfolioPrompt?: string;
    websiteAriaLabel?: string;
    instagramAriaLabel?: string;
    ariaLabel?: string;
  };
  shortcuts?: {
    countdown?: string;
    events?: string;
    rsvp?: string;
    navAriaLabel?: string;
    openAriaLabel?: string;
  };
  media?: {
    coverBg?: string;
    desktopBg?: string;
    paperBg?: string;
    rumahBolon?: string;
    bunga?: string;
    divider?: string;
    closing?: string;
    ulos?: string;
    heroPhoto?: string;
    portrait?: string;
    audio?: string;
    video?: string;
    ogImage?: string;
  };
  rsvp?: RsvpContent;
  guestbook?: GuestbookContent;
  invite?: {
    whatsappTemplates?: InviteMessageTemplate[];
    /** @deprecated use whatsappTemplates */
    whatsappTemplate?: string;
    defaultTemplateId?: string;
    salutation?: string;
    listTitle?: string;
    listSubtitle?: string;
    addGuestButton?: string;
    searchPlaceholder?: string;
    emptyGuests?: string;
    copyLink?: string;
    copyLinkSuccess?: string;
    openWhatsApp?: string;
    noPhone?: string;
    saveTemplateHint?: string;
    templateLabel?: string;
    templatesSubtitle?: string;
    templateSelectLabel?: string;
    defaultTemplateLabel?: string;
    templateNameLabel?: string;
    templateMessageLabel?: string;
    phoneLabel?: string;
    nameLabel?: string;
    slugLabel?: string;
    linkLabel?: string;
    deleteConfirm?: string;
    guestAdded?: string;
    guestUpdated?: string;
    guestDeleted?: string;
    guestError?: string;
  };
};

export type SiteContentRow = {
  id: string;
  content: SiteContentOverrides;
  updated_at: string;
};
