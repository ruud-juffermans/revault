import { Button, type ButtonProps } from "@mui/material";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type LinkHref = ComponentProps<typeof Link>["href"];

/**
 * MUI Button that navigates to a localized (possibly dynamic) route. MUI's
 * Button collapses `href` to a string; the object form is forwarded to Link
 * untouched at runtime, so only the type needs correcting — done here once.
 */
export default function LinkButton({ href, ...props }: Omit<ButtonProps, "href"> & { href: LinkHref }) {
  const linkProps = { component: Link, href } as unknown as ButtonProps;
  return <Button {...props} {...linkProps} />;
}
