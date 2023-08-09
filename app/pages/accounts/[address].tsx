import AccountActivities from "@/components/account/AccountActivities";
import AccountProfile from "@/components/account/AccountProfile";
import Layout from "@/components/layout";
import { FullWidthSkeleton } from "@/components/styled";
import { Container } from "@mui/material";
import { useRouter } from "next/router";

/**
 * Page with an account.
 */
export default function Account() {
  const router = useRouter();
  const { address } = router.query;

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
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          py: 6,
        }}
      >
        {address ? (
          <>
            <AccountProfile address={address as `0x${string}`} />
            <AccountActivities address={address as `0x${string}`} />
          </>
        ) : (
          <FullWidthSkeleton />
        )}
      </Container>
    </Layout>
  );
}
