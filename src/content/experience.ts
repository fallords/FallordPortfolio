/* ==========================================================================
 * PENGALAMAN KERJA
 * --------------------------------------------------------------------------
 * Diambil dari profil LinkedIn (November 2026). Jabatan, nama instansi,
 * jenis, dan tanggal ditulis persis seperti di sana; lokasi diringkas ke
 * kotanya, dan deskripsinya diringkas ke gaya situs ini tanpa menambah
 * klaim baru.
 *
 * URUTAN ARRAY = URUTAN TAMPIL: yang terbaru di atas.
 * Posisi yang masih berjalan: kosongkan `end`.
 * ========================================================================== */

export interface Role {
    title: string;
    org: string;
    /** Keterangan di belakang nama: nama Inggrisnya, atau induk perusahaannya. */
    orgNote?: string;
    /** Contract, Internship, Freelance… seperti di LinkedIn. */
    type: string;
    /** "Mar 2026". */
    start: string;
    end?: string;
    place: string;
    summary: string;
    projects?: { name: string; desc: string }[];
}

export const experience: Role[] = [
    {
        title: "AI Evaluator",
        org: "Outlier",
        type: "Contract",
        start: "Sep 2026",
        end: "Sep 2026",
        place: "Remote",
        summary:
            "Evaluating AI models across different projects: testing their responses against set guidelines and quality criteria, for accuracy, relevance, instruction following, reasoning and whether the task got done, and comparing models side by side.",
    },
    {
        title: "Software Developer",
        org: "PT Asadel Liamsindo Teknologi",
        orgNote: "member of Lensetek International, LLC, Colorado, USA",
        type: "Internship",
        start: "Mar 2026",
        end: "Sep 2026",
        place: "Remote",
        summary: "A structured international internship in technology-driven innovation and digital transformation, learning through projects: software design and full-stack development.",
    },
    {
        title: "Software Engineer",
        org: "Dinas Pendidikan Provinsi Jawa Barat",
        orgNote: "West Java Education Department",
        type: "Internship",
        start: "Aug 2025",
        end: "Nov 2025",
        place: "Bandung · On-site",
        summary: "Web systems for the province's education sector, built with multidisciplinary teams for government use.",
        projects: [
            {
                name: "LMS Jabar",
                desc: "A learning management system, designed, built and deployed from scratch in Next.js, prototyped in Figma and documented with DFDs and use case diagrams.",
            },
            {
                name: "Sipalawa",
                desc: "The user interfaces and the technical documentation (DFDs, use case diagrams), working with cross-functional teams to bring design and implementation together.",
            },
        ],
    },
    {
        title: "Frontend Web Developer",
        org: "Kementerian Perhubungan Republik Indonesia",
        orgNote: "Ministry of Transportation",
        type: "Freelance",
        start: "May 2024",
        end: "Jul 2024",
        place: "Bandung · Hybrid",
        summary:
            "The public side of the ministry's official website: a redesign with new content, bug fixes and new features, a colour palette in line with the agency's branding, and a layout that works on every screen size.",
    },
];
