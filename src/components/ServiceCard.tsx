import { Card, CardContent, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/services";

export default function ServiceCard({ slug, title, desc }: { slug: ServiceSlug; title: string; desc: string }) {
  return (
    <Card component={Link} href={{ pathname: "/services/[slug]", params: { slug } }} sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3.5, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
          {desc}
        </Typography>
        <ArrowForwardIcon sx={{ mt: 2.5, color: "var(--app-accent)", fontSize: 20 }} />
      </CardContent>
    </Card>
  );
}
