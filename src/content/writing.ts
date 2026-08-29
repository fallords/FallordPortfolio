/* ==========================================================================
 * TULISAN
 * --------------------------------------------------------------------------
 * Abstrak di bawah disalin kata per kata dari preprint aslinya — tidak
 * diringkas dan tidak ditulis ulang.
 *
 * Untuk makalah akademik, halamannya menampilkan abstrak, kata kunci, dan
 * metadata, lalu menautkan PDF penuhnya. Menyalin 9.444 kata beserta sitasi
 * dalam teks dan daftar pustaka ke dalam array paragraf akan merusak keduanya,
 * dan transkripsi makalah yang berantakan lebih buruk daripada tidak ada.
 * ========================================================================== */

export type EssayField =
    | "Psychology"
    | "Social Science"
    | "Humanities"
    | "Language"
    | "Communication"
    | "Business"
    | "Science"
    | "Engineering";

export interface Essay {
    /** Dipakai sebagai URL: /writing/<slug>. */
    slug: string;
    title: string;
    /** Sub-judul di sampul, kalau ada. */
    subtitle?: string;
    year: string;
    field: EssayField;
    /** Satu kalimat untuk daftar di beranda. */
    summary: string;
    readingTime: string;
    /**
     * Isi, satu string per paragraf.
     *   "## Teks"  → subjudul
     *   "> Teks"   → kutipan blok
     */
    body: string[];
    /** Status terbit, mis. "Preprint — not peer reviewed". */
    publishedIn?: string;
    /** Kata kunci resmi makalah. */
    keywords?: string[];
    /** PDF lengkap di /public. */
    pdfUrl?: string;
    /** ORCID penulis, kalau makalahnya mencantumkan. */
    orcid?: string;
}

export const yourEssays: Essay[] = [
    {
        slug: "privacy-as-boundary-and-pretext",
        title: "Privacy as Boundary and Pretext in Concealing Parallel Relationships",
        subtitle:
            "A reflective essay drawn from five conversations about digitally mediated relationships",
        year: "2026",
        field: "Social Science",
        summary:
            "How people account for a door they have closed — and why two opposite explanations turn out to make the same move.",
        readingTime: "47 min",
        publishedIn: "Preprint · Independent work, not peer reviewed · Version 1",
        orcid: "0009-0006-4120-866X",
        keywords: [
            "Information control",
            "Concealment of parallel relationships",
            "Communication privacy management",
            "Liquid relationships",
            "Computer-mediated communication",
        ],
        pdfUrl: "/privacy-as-boundary-and-pretext.pdf",
        body: [
            "## Abstract",
            "This essay draws on five conversations the author had with people who had been through serious conflict in relationships conducted largely through digital media. It is not a study. The conversations were not recorded and no notes were kept, so what follows is the author's recollection written up afterwards, and no direct quotation appears anywhere. What is examined is not having more than one partner but keeping it hidden: controlling the story, closing off access to information, and leaving the emotional work to the person being deceived. Three of the five described doing the hiding, two described being on the receiving end. Read side by side, the accounts repeat five things, from trust being built to trust breaking down. Only one ordering claim is made: concealment follows trust rather than preceding it.",
            "The central observation concerns how people explain a door they have closed. One called their use of privacy a wall they knew stopped questions; another called it a long-standing habit whose concealing effect they had not noticed. The essay cannot say which account is accurate, since its own argument is that people in this position shape their stories. It argues instead that both make the same move: they turn attention away from responsibility, one by claiming injury, the other by claiming unawareness.",
            "## Reading the full text",
            "The complete preprint runs to twenty-one pages and includes the method, the five recurring stages, the limits of applying communication privacy management in an Indonesian setting, and a full reference list. It is linked below.",
        ],
    },
];

/* -------------------------------------------------------------------------- */

const isDev = process.env.NODE_ENV === "development";

/** Contoh hanya tampil di dev, dan hanya selama belum ada tulisan asli. */
const sampleEssays: Essay[] = [];

export const essays: Essay[] =
    yourEssays.length > 0 ? yourEssays : isDev ? sampleEssays : [];

/** Terbaru lebih dulu. */
export const essaysByYear = [...essays].sort((a, b) => Number(b.year) - Number(a.year));

export const hasEssays = essays.length > 0;
