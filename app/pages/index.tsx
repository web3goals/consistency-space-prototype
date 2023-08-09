import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { Box, Container, Typography } from "@mui/material";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <Layout
      maxWidth={false}
      disableGutters
      sx={{
        p: 0,
        background: "linear-gradient(135deg, #FF5722, #FFC107);",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 6,
        }}
      >
        {/* Left part */}
        <Box sx={{ textAlign: { xs: "center", md: "start" }, mr: { md: 5 } }}>
          <Typography variant="h1" fontWeight={700} color="#FFFFFF" mt={2}>
            Be successful by being consistently in public space
          </Typography>
          <Typography variant="h6" color="#FFFFFF" mt={1}>
            Check-in activity, inspire followers and get motivated with your
            friends
          </Typography>
          {address ? (
            <Link href={`/accounts/${address}`}>
              <ExtraLargeLoadingButton variant="contained" sx={{ mt: 4 }}>
                Let’s go!
              </ExtraLargeLoadingButton>
            </Link>
          ) : (
            <ExtraLargeLoadingButton
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => openConnectModal?.()}
            >
              Let’s go!
            </ExtraLargeLoadingButton>
          )}
        </Box>
        {/* Right part */}
        <Box width={{ xs: "50%", md: "60%", lg: "40%" }}>
          <Image
            src="/images/device.png"
            alt="Partnership"
            width="100"
            height="100"
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
      </Container>
    </Layout>
  );
}
