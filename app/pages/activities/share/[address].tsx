import Layout from "@/components/layout";
import { LargeLoadingButton } from "@/components/styled";
import useToasts from "@/hooks/useToast";
import { Telegram, Twitter } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Page to share an account activity.
 */
export default function Share() {
  const router = useRouter();
  const { address } = router.query;
  const { showToastSuccess } = useToasts();
  const appLink = `${global.window.location.origin}/accounts/${address}`;
  const twitterLink = `https://twitter.com/intent/tweet?url=${appLink}`;
  const telegramLink = `https://t.me/share/url?url=${appLink}`;

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        📢 Share your activity
      </Typography>
      <Typography textAlign="center" mt={1}>
        to inspire your friends and followers
      </Typography>
      <Box
        sx={{
          width: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 3,
        }}
      >
        {/* Buttons to share via social networks */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            href={twitterLink}
            target="_blank"
            color="primary"
            sx={{ border: 4, p: 3 }}
          >
            <Twitter sx={{ fontSize: 36 }} />
          </IconButton>
          <IconButton
            href={telegramLink}
            target="_blank"
            color="primary"
            sx={{ border: 4, p: 3 }}
          >
            <Telegram sx={{ fontSize: 36 }} />
          </IconButton>
        </Stack>
        {/* Link and copy button */}
        <Box
          sx={{
            width: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            border: 3,
            borderColor: "divider",
            borderRadius: 5,
            px: { xs: 1, md: 2 },
            py: { xs: 2, md: 1 },
            mt: 3,
          }}
        >
          <Link href={appLink} legacyBehavior passHref>
            <MuiLink
              sx={{
                lineBreak: "anywhere",
                fontWeight: 700,
                textAlign: "center",
                mb: { xs: 2, md: 0 },
              }}
            >
              {appLink}
            </MuiLink>
          </Link>
          <LargeLoadingButton
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(appLink);
              showToastSuccess("Link copied");
            }}
          >
            Copy
          </LargeLoadingButton>
        </Box>
      </Box>
    </Layout>
  );
}
