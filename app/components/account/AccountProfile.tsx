import {
  AlternateEmail,
  Instagram,
  Language,
  Telegram,
  Twitter,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FullWidthSkeleton, LargeLoadingButton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import useUriDataLoader from "hooks/useUriDataLoader";
import Link from "next/link";
import { isAddressesEqual } from "utils/addresses";
import { chainToSupportedChainConfig } from "utils/chains";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "./AccountAvatar";
import AccountLink from "./AccountLink";

/**
 * A component with account profile.
 */
export default function AccountProfile(props: { address: `0x${string}` }) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [props.address],
  });
  const { data: profileUriData } = useUriDataLoader(profileUri);

  if (profileUri === "" || profileUriData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Image */}
        <AccountAvatar
          account={props.address}
          accountProfileUriData={profileUriData}
          size={164}
          emojiSize={64}
          sx={{ mb: 3 }}
        />
        {/* Name */}
        <AccountLink
          account={props.address}
          accountProfileUriData={profileUriData}
          variant="h4"
          textAlign="center"
          color="#FFFFFF"
        />
        {/* About */}
        {profileUriData?.attributes?.[1]?.value && (
          <Typography
            textAlign="center"
            sx={{ color: "#FFFFFF", maxWidth: 480, mt: 1 }}
          >
            {profileUriData.attributes[1].value}
          </Typography>
        )}
        {/* Links and other data */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          alignItems="center"
          mt={1.5}
          divider={
            <Divider orientation="vertical" flexItem sx={{ borderWidth: 2 }} />
          }
          spacing={2}
        >
          {/* Email and links */}
          <Stack direction="row" alignItems="center">
            {profileUriData?.attributes?.[2]?.value && (
              <IconButton
                href={`mailto:${profileUriData.attributes[2].value}`}
                target="_blank"
                component="a"
                sx={{ color: "#FFFFFF" }}
              >
                <AlternateEmail />
              </IconButton>
            )}
            {profileUriData?.attributes?.[3]?.value && (
              <IconButton
                href={profileUriData.attributes[3].value}
                target="_blank"
                component="a"
                sx={{ color: "#FFFFFF" }}
              >
                <Language />
              </IconButton>
            )}
            {profileUriData?.attributes?.[4]?.value && (
              <IconButton
                href={`https://twitter.com/${profileUriData.attributes[4].value}`}
                target="_blank"
                component="a"
                sx={{ color: "#FFFFFF" }}
              >
                <Twitter />
              </IconButton>
            )}
            {profileUriData?.attributes?.[5]?.value && (
              <IconButton
                href={`https://t.me/${profileUriData.attributes[5].value}`}
                target="_blank"
                component="a"
                sx={{ color: "#FFFFFF" }}
              >
                <Telegram />
              </IconButton>
            )}
            {profileUriData?.attributes?.[6]?.value && (
              <IconButton
                href={`https://instagram.com/${profileUriData.attributes[6].value}`}
                target="_blank"
                component="a"
                sx={{ color: "#FFFFFF" }}
              >
                <Instagram />
              </IconButton>
            )}
          </Stack>
        </Stack>
        {/* Owner buttons */}
        {isAddressesEqual(address, props.address) && (
          <Stack
            direction="column"
            spacing={1}
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Link href="/accounts/edit">
              <LargeLoadingButton variant="contained" sx={{ width: 280 }}>
                {profileUriData ? "✍️ Edit Profile" : "✍️ Create Profile"}
              </LargeLoadingButton>
            </Link>
            <Link href="/activities/create">
              <LargeLoadingButton variant="contained" sx={{ width: 280 }}>
                🚀 Create Activity
              </LargeLoadingButton>
            </Link>
          </Stack>
        )}
      </Box>
    );
  }

  return <FullWidthSkeleton />;
}
