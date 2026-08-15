// Public-domain commentaries served via the Free Use Bible API (bible.helloao.org).
// Picked for trustworthiness + complementary style: a devotional overview (Henry),
// a balanced verse-by-verse scholarly note (JFB), and an exhaustive deep-dive (Gill).
export interface CommentarySource {
  id: string;
  label: string;
  shortLabel: string;
  author: string;
  years: string;
  description: string;
  bio: string;
}

export const COMMENTARY_SOURCES: CommentarySource[] = [
  {
    id: "matthew-henry",
    label: "Matthew Henry",
    shortLabel: "Henry",
    author: "Matthew Henry",
    years: "1662–1714",
    description: "Devotional, practical exposition — reads passage-by-passage rather than verse-by-verse.",
    bio: "An English Nonconformist (Presbyterian) minister who pastored in Chester for 25 years. His Exposition of the Old and New Testament — completed after his death by fellow ministers using his notes — is one of the most widely read Bible commentaries in the English language. George Whitefield and Charles Spurgeon both praised it; Spurgeon reportedly read it through several times and urged every preacher to own a copy. It's valued less for technical scholarship than for its pastoral warmth, practical application, and memorably quotable turns of phrase.",
  },
  {
    id: "jamieson-fausset-brown",
    label: "Jamieson-Fausset-Brown",
    shortLabel: "JFB",
    author: "Jamieson, Fausset & Brown",
    years: "1871",
    description: "Balanced verse-by-verse scholarly notes — concise and widely cited.",
    bio: "A collaboration between three 19th-century clergymen-scholars: Robert Jamieson (Church of Scotland minister), Andrew Robert Fausset (Church of Ireland rector and classical scholar), and David Brown (Free Church of Scotland theologian and college principal in Aberdeen). Their Commentary Critical and Explanatory on the Whole Bible pairs careful textual and historical notes with practical application, and has stayed a standard reference in evangelical pastoral and lay study for over 150 years.",
  },
  {
    id: "john-gill",
    label: "John Gill",
    shortLabel: "Gill",
    author: "John Gill",
    years: "1697–1771",
    description: "Exhaustive verse-by-verse exposition with deep original-language notes.",
    bio: "An English Baptist pastor who led the Southwark congregation later pastored by Charles Spurgeon (Metropolitan Tabernacle) for 51 years, and one of the foremost Hebrew scholars of his era — Aberdeen awarded him a Doctor of Divinity in 1748. His Exposition of the Entire Bible is among the most exhaustive verse-by-verse commentaries ever written by a single author, distinguished by its deep engagement with Hebrew, Greek, and rabbinic sources. Still cited today for its linguistic depth.",
  },
];

export const DEFAULT_COMMENTARY = "matthew-henry";

export function isCommentarySource(id: string): boolean {
  return COMMENTARY_SOURCES.some((s) => s.id === id);
}

export function commentarySource(id: string): CommentarySource | undefined {
  return COMMENTARY_SOURCES.find((s) => s.id === id);
}
