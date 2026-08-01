# global

Global shell components: TopNavBar, Footer, SideNavBar, Admin Header.

Implemented (Phase 9.3.6): `TopNavBar.tsx`, `Footer.tsx` — rendered directly
inside each of the 9 public page components rather than wired into
`src/app/(public)/layout.tsx`, since modifying layouts was out of scope for
this phase (see the Implementation Report, "Known limitation"). SideNavBar
and Admin Header remain unimplemented — admin-scoped, out of scope here.
