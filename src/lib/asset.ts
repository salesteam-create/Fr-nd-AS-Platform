// Static files need the GitHub Pages base path; next/link adds it for routes, but not for <img>.
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
