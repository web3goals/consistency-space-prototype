import { activityContractAbi } from "@/contracts/abi/acitivtyContract";
import useToasts from "@/hooks/useToast";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Box, Stack, SxProps, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import EntityList from "../entity/EntityList";
import { CardBox, FullWidthSkeleton, MediumLoadingButton } from "../styled";

/**
 * A component with account activities.
 */
export default function AccountActivities(props: {
  address: `0x${string}`;
  sx?: SxProps;
}) {
  const { chain } = useNetwork();

  /**
   * Define account balance of activities
   */
  const { data: balance } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "balanceOf",
    args: [props.address],
  });
  const tokenIndexes =
    balance !== undefined
      ? [...Array.from(Array(Number(balance)).keys())].reverse()
      : undefined;

  return (
    <>
      <EntityList
        entities={tokenIndexes}
        renderEntityCard={(tokenIndex, index) => (
          <AccountActivityCard
            address={props.address}
            tokenIndex={tokenIndex}
            key={index}
          />
        )}
        noEntitiesText="😐 no activities"
        sx={{ mt: 4 }}
      />
    </>
  );
}

function AccountActivityCard(props: {
  address: `0x${string}`;
  tokenIndex: number;
}) {
  const { chain } = useNetwork();

  /**
   * Define token id
   */
  const { data: tokenId } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "tokenOfOwnerByIndex",
    args: [props.address, BigInt(props.tokenIndex)],
  });

  /**
   * Define token params
   */
  const { data: tokenParams } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "getParams",
    args: [tokenId as bigint],
    enabled: tokenId !== undefined,
  });

  /**
   * Define token check-ins
   */
  const { data: tokenCheckIns, refetch: refetchTokenCheckIns } =
    useContractRead({
      address: chainToSupportedChainConfig(chain).contracts.activity,
      abi: activityContractAbi,
      functionName: "getCheckIns",
      args: [tokenId as bigint],
      enabled: tokenId !== undefined,
    });

  if (tokenId && tokenParams && tokenCheckIns) {
    return (
      <CardBox>
        <Typography variant="h6" fontWeight={700}>
          {tokenParams.description}
        </Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Typography color={orange[500]} fontWeight={700}>
            {tokenCheckIns.length}
          </Typography>
          <Typography>check-ins total</Typography>
        </Stack>
        {tokenParams.checkInRequirement === 1 && (
          <Stack direction="row" spacing={1} mt={0.5}>
            <Typography color={orange[500]} fontWeight={700}>
              Everyone
            </Typography>
            <Typography>can check in this activity</Typography>
          </Stack>
        )}
        <AccountActivityCardActions
          address={props.address}
          tokenId={tokenId}
          tokenCheckInRequirement={tokenParams.checkInRequirement}
          onCheckedIn={refetchTokenCheckIns}
          sx={{ mt: 1 }}
        />
        <AccountActivityCardCalendar
          tokenCheckIns={tokenCheckIns}
          sx={{ mt: 4, mb: 4 }}
        />
        <AccountActivityCardReactions />
      </CardBox>
    );
  }

  return <FullWidthSkeleton />;
}

function AccountActivityCardActions(props: {
  address: `0x${string}`;
  tokenId: bigint;
  tokenCheckInRequirement: number;
  onCheckedIn: () => void;
  sx?: SxProps;
}) {
  const { address } = useAccount();

  return (
    <Stack direction="row" spacing={2} sx={{ ...props.sx }}>
      {props.tokenCheckInRequirement === 0 && props.address === address && (
        <AccountActivityCardActionsCheckInButton
          tokenId={props.tokenId}
          onCheckedIn={props.onCheckedIn}
        />
      )}
      {props.tokenCheckInRequirement === 1 && (
        <AccountActivityCardActionsCheckInButton
          tokenId={props.tokenId}
          onCheckedIn={props.onCheckedIn}
        />
      )}
      {/* TODO: Implement button */}
      <MediumLoadingButton variant="outlined">📢 Share</MediumLoadingButton>
    </Stack>
  );
}

function AccountActivityCardActionsCheckInButton(props: {
  tokenId: bigint;
  onCheckedIn: () => void;
}) {
  const { chain } = useNetwork();
  const { showToastSuccess } = useToasts();

  /**
   * Contract states
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "checkIn",
    args: [props.tokenId],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Form states
   */
  const isButtonLoading = isContractWriteLoading || isTransactionLoading;
  const isButtonDisabled =
    isButtonLoading || isTransactionSuccess || !contractWrite;

  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Activity is checked in");
      props.onCheckedIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  return (
    <MediumLoadingButton
      variant="contained"
      loading={isButtonLoading}
      disabled={isButtonDisabled}
      onClick={() => contractWrite?.()}
    >
      ✅ Check In
    </MediumLoadingButton>
  );
}

function AccountActivityCardCalendar(props: {
  tokenCheckIns: readonly bigint[];
  sx?: SxProps;
}) {
  const [config, setConfig] = useState<
    | {
        startDate: Date;
        endDate: Date;
        values: { date: string; count: number }[];
      }
    | undefined
  >();

  useEffect(() => {
    // Build map with dates and counts
    const dateCounts = new Map();
    for (const checkIn of props.tokenCheckIns) {
      const date = new Date(Number(checkIn) * 1000).toISOString().split("T")[0];
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
    }
    // Set config
    setConfig({
      startDate: new Date("2023-03-15"),
      endDate: new Date(),
      values: Array.from(dateCounts).map((value) => ({
        date: value[0],
        count: value[1],
      })),
    });
  }, [props.tokenCheckIns]);

  return (
    <Box sx={{ ...props.sx }}>
      {config ? (
        <CalendarHeatmap
          startDate={config.startDate}
          endDate={config.endDate}
          values={config.values}
          titleForValue={(value) => `${value?.count || 0} check-ins`}
        />
      ) : (
        <FullWidthSkeleton />
      )}
    </Box>
  );
}

// TODO: Display real reactions
function AccountActivityCardReactions() {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <MediumLoadingButton
          variant="contained"
          sx={{
            background: orange[500],
            "&:hover": {
              background: orange[300],
            },
          }}
        >
          🤘 It’s inspiring!
        </MediumLoadingButton>
        <Typography variant="h6" color={orange[500]} fontWeight={700}>
          7
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <MediumLoadingButton
          variant="outlined"
          sx={{
            color: orange[500],
            borderColor: orange[500],
            "&:hover": {
              color: orange[300],
              borderColor: orange[300],
            },
          }}
        >
          🤯 You are crazy!
        </MediumLoadingButton>
        <Typography variant="h6" color={orange[500]} fontWeight={700}>
          19
        </Typography>
      </Stack>
    </Stack>
  );
}
