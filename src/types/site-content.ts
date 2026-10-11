import type { GiftAccount, WeddingEvent } from "../config/wedding.config";
import type { InviteMessageTemplate } from "../config/invite-templates";

export type RsvpContent = {
  title?: string;
  subtitle?: string;
  note?: string;
  deadline?: string;
  deadlineLabel?: string;
  deadlineClosedMessage?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  messagePlaceholder?: string;
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
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  namePlaceholder?: string;
  messagePlaceholder?: string;
  submit?: string;
  submitting?: string;
  emptyMessage?: string;
  emptyNoSupabase?: string;
  lockedMessage?: string;
  limitReachedMessage?: string;
  remainingLabel?: string;
  countLabel?: string;
  loadMore?: string;
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
      url?: string;
      websiteUrl?: string;
    };
  };
  couple?: {
    groom?: {
      shortName?: string;
      fullName?: string;
      parents?: string;
      instagramHandle?: string;
      photo?: string;
    };
    bride?: {
      shortName?: string;
      fullName?: string;
      parents?: string;
      instagramHandle?: string;
      photo?: string;
    };
  };
  contact?: {
    whatsappNumber?: string;
    rsvpWhatsappEnabled?: boolean;
    rsvpWhatsappTemplate?: string;
    giftWhatsappTemplate?: string;
  };
  coupleSection?: {
    prefix?: string;
    title?: string;
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
  bibleQuote?: string;
  bibleReference?: string;
  events?: WeddingEvent[];
  eventsSection?: {
    calendarGoogleButton?: string;
    sheetMapsButton?: string;
    calendarSaveAll?: string;
  };
  story?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    milestones?: {
      date?: string;
      title?: string;
      text?: string;
      photo?: string;
    }[];
    /** @deprecated use milestones */
    paragraphs?: string[];
  };
  gallery?: {
    title?: string;
    images?: { src: string; alt: string }[];
  };
  gift?: {
    title?: string;
    description?: string;
    qris?: string;
    qrisBride?: string;
    qrisGroom?: string;
    accounts?: GiftAccount[];
  };
  giftUi?: {
    openButton?: string;
    copyAccountSuccess?: string;
    copyError?: string;
  };
  hashtag?: {
    title?: string;
    subtitle?: string;
    tag?: string;
    lead?: string;
    storyTemplate?: string;
    boothButton?: string;
    boothMaxSeconds?: number;
    boothShare?: string;
    boothRetry?: string;
    boothDenied?: string;
    storyButton?: string;
    storyHint?: string;
    storyFallbackToast?: string;
    copySuccess?: string;
    instagramButton?: string;
  };
  music?: {
    playLabel?: string;
    muteLabel?: string;
  };
  opening?: {
    skipLabel?: string;
  };
  cover?: {
    salutation?: string;
    openButton?: string;
    openButtonAriaLabel?: string;
  };
  countdown?: {
    labels?: {
      days?: string;
      hours?: string;
      minutes?: string;
      seconds?: string;
    };
  };
  footer?: {
    creditPrefix?: string;
    creditBrand?: string;
    websiteAriaLabel?: string;
  };
  shortcuts?: {
    events?: string;
    rsvp?: string;
  };
  media?: {
    coverBg?: string;
    audio?: string;
    ogImage?: string;
    logo?: string;
    openingVideo?: string;
    heroVideo?: string;
    heroPoster?: string;
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
    guestNameRequired?: string;
    guestError?: string;
    bulkToggle?: string;
    bulkPastePlaceholder?: string;
    bulkPasteHint?: string;
    bulkCsvHint?: string;
    bulkCsvButton?: string;
    bulkPreviewButton?: string;
    bulkImportButton?: string;
    bulkCancelButton?: string;
    bulkReadyLabel?: string;
    bulkColStatus?: string;
    bulkStatusOk?: string;
    bulkImported?: string;
    bulkImportError?: string;
    bulkEmptyPreview?: string;
    waSentLabel?: string;
    waUnsentLabel?: string;
    markWaSent?: string;
    markWaUnsent?: string;
    waMarkedSent?: string;
    waMarkedUnsent?: string;
  };
};

export type SiteContentRow = {
  id: string;
  content: SiteContentOverrides;
  updated_at: string;
};
