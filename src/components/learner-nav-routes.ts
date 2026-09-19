export function matchesLearnerRoute(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`) || (href === "/full-mock" && (path === "/demo-test" || path.startsWith("/demo-test/")));
}
