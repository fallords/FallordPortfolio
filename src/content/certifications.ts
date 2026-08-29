/* ==========================================================================
 * SERTIFIKAT
 * --------------------------------------------------------------------------
 * Semua entri di bawah dibaca langsung dari dokumen aslinya di folder
 * Certificate — nama kursus, penerbit, dan tanggal diambil apa adanya dari
 * sertifikatnya, bukan dari nama file.
 *
 * URUTAN ARRAY = URUTAN TAMPIL. Tidak ada pengurutan otomatis, dan itu
 * disengaja: yang paling relevan dengan pekerjaan Anda harus terlihat lebih
 * dulu, dan "paling relevan" bukan sesuatu yang bisa disimpulkan dari tanggal.
 * Sertifikat rekayasa dan AI di atas, sisanya menyusul.
 *
 * Menambah yang baru:
 *   1. Simpan scan ke  public/certificates/  (JPEG, sisi terpanjang ~1600px)
 *   2. Sisipkan entri di posisi yang Anda mau
 *
 * Bentuk scan tidak perlu didaftarkan. Semua kartu memakai satu rasio bingkai
 * dan gambarnya di-`object-contain`, jadi scan potret maupun lanskap masuk utuh
 * tanpa terpotong.
 * ========================================================================== */

export interface Certification {
    name: string;
    /** Lembaga penerbit, persis seperti tertulis di sertifikat. */
    issuer: string;
    year: string;
    /** Bidang — ditampilkan berdampingan supaya jangkauan Anda terlihat sekilas. */
    field?: string;
    /** Path scan di /public. */
    image?: string;
    /** Halaman verifikasi resmi, hanya kalau tercetak di sertifikatnya. */
    url?: string;
}

export const certifications: Certification[] = [
    /* ---------------------------- Cloud, AI, rekayasa --------------------- */
    {
        name: "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional",
        issuer: "Oracle University",
        year: "2025",
        field: "Generative AI",
        image: "/certificates/oracle-generative-ai-professional.jpg",
        url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=FBBA625D6F7A0A7696C78F7B348891990731AABE9EC58381C159999D05ABADD2",
    },
    {
        name: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
        issuer: "Oracle University",
        year: "2025",
        field: "Artificial Intelligence",
        image: "/certificates/oracle-ai-foundations-associate.jpg",
        url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=EF002A6A73E4678FB1E2EA771BC15319B723DA2241543409B27748F2CE502967",
    },
    {
        name: "Oracle Cloud Infrastructure 2025 Certified Foundations Associate",
        issuer: "Oracle University",
        year: "2025",
        field: "Cloud Infrastructure",
        image: "/certificates/oracle-foundations-associate.jpg",
        url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=43BB7E0AD7DBD215855B55C1738D05B8043BAE0E3DF04F132237900293475E63",
    },
    {
        name: "CS50: Computer Science for Business Professionals",
        issuer: "Harvard University",
        year: "2024",
        field: "Computer Science",
        image: "/certificates/harvard-cs50.jpg",
        url: "https://cs50.harvard.edu/certificates/c7ed9125-c111-4b0e-adc7-5ee0a63d2d4e",
    },
    {
        name: "Intro to Programming",
        issuer: "Kaggle",
        year: "2025",
        field: "Programming",
        image: "/certificates/kaggle-programming.jpg",
    },

    /* ------------------------------ Di luar itu --------------------------- */
    {
        name: "Introduction to Psychology (PSYCH101)",
        issuer: "Saylor Academy",
        year: "2025",
        field: "Psychology",
        image: "/certificates/psychology.jpg",
    },
    {
        name: "Introduction to Political Science (POLSC101)",
        issuer: "Saylor Academy",
        year: "2025",
        field: "Political Science",
        image: "/certificates/political-science.jpg",
    },
    {
        name: "Introduction to Adolescent Mental Health",
        issuer: "The Open University",
        year: "2025",
        field: "Psychology",
        image: "/certificates/adolescent-mental-health.jpg",
    },
    {
        name: "Prevention of Sexual Exploitation and Abuse",
        issuer: "UNICEF",
        year: "2025",
        field: "Safeguarding",
        image: "/certificates/psea-unicef.jpg",
    },
];
