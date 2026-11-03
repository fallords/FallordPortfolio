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
            "I tested AI models' responses on different projects against set guidelines and quality criteria: accuracy, relevance, instruction following, reasoning and whether the task got done. I also compared models side by side.",
    },
    {
        title: "Software Developer",
        org: "PT Asadel Liamsindo Teknologi",
        orgNote: "member of Lensetek International, LLC, Colorado, USA",
        type: "Internship",
        start: "Mar 2026",
        end: "Sep 2026",
        place: "Remote",
        summary: "An international internship in digital transformation, run as project-based learning. I worked on software design and full-stack development.",
    },
    {
        title: "Software Engineer",
        org: "Dinas Pendidikan Provinsi Jawa Barat",
        orgNote: "West Java Education Department",
        type: "Internship",
        start: "Aug 2025",
        end: "Nov 2025",
        place: "Bandung · On-site",
        summary: "I built web systems for the province's education sector with multidisciplinary teams, for government use.",
        projects: [
            {
                name: "LMS Jabar",
                desc: "A learning management system I designed, built and deployed from scratch in Next.js. I prototyped it in Figma and documented it with DFDs and use case diagrams.",
            },
            {
                name: "Sipalawa",
                desc: "I built its user interfaces and wrote its technical documentation (DFDs, use case diagrams), working with cross-functional teams on design and implementation.",
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
            "I worked on the public side of the ministry's official website: a redesign with new content, bug fixes, new features, a colour palette that matches the agency's branding, and a layout that works on every screen size.",
    },
];
