import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  backTo,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 4,
      }}
    >
      <Box>
        {backTo && (
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(backTo)}
            sx={{ mb: 1 }}
          >
            Back
          </Button>
        )}

        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && <Box>{actions}</Box>}
    </Box>
  );
}