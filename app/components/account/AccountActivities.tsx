import { activityContractAbi } from "@/contracts/abi/acitivtyContract";
import { useSigner } from "@/hooks/easWagmiUtils";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Box, Stack, SxProps, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
import axios from "axios";
import { ethers } from "ethers";
import Link from "next/link";
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
  const { handleError } = useError();

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

  /**
   * Define token EAS check-ins
   */
  const [tokenEasCheckIns, setTokenEasCheckIns] = useState<
    number[] | undefined
  >([]);

  async function loadTokenEasCheckIns() {
    // Check token id
    if (!tokenId) {
      return;
    }
    // Check Graph QL
    const graphQl = chainToSupportedChainConfig(chain).eas.graphQl;
    if (!graphQl) {
      return;
    }
    try {
      const schemaId = chainToSupportedChainConfig(chain).eas.schemaUid;
      const paddedTokenId = ethers.zeroPadValue(ethers.toBeHex(tokenId), 32);
      const query = `
        query Attestations {
          attestations(where: {schemaId: {equals: "${schemaId}"}, data: {equals: "${paddedTokenId}"} }) {
            time
          }
        }
      `;
      const { data } = await axios.post(
        chainToSupportedChainConfig(chain).eas.graphQl as string,
        { query: query }
      );

      setTokenEasCheckIns(
        data.data.attestations.map((value: any) => value.time)
      );
    } catch (error: any) {
      handleError(error, true);
    }
  }

  useEffect(() => {
    loadTokenEasCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

  if (tokenId && tokenParams && tokenCheckIns && tokenEasCheckIns) {
    return (
      <CardBox>
        <Typography variant="h6" fontWeight={700}>
          {tokenParams.description}
        </Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Typography color={orange[500]} fontWeight={700}>
            {tokenCheckIns.length + tokenEasCheckIns.length}
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
          onCheckedIn={() => {
            refetchTokenCheckIns();
            loadTokenEasCheckIns();
          }}
          sx={{ mt: 1 }}
        />
        <AccountActivityCardCalendar
          tokenColor={tokenParams.color}
          tokenCheckIns={tokenCheckIns}
          tokenEasCheckIns={tokenEasCheckIns}
          sx={{ mt: 4 }}
        />
        <AccountActivityCardReactions tokenId={tokenId} sx={{ mt: 2 }} />
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
  const { chain } = useNetwork();
  const { address } = useAccount();

  const isEasSupported =
    chainToSupportedChainConfig(chain).eas.contract &&
    chainToSupportedChainConfig(chain).eas.schemaUid;

  return (
    <Stack direction="row" spacing={2} sx={{ ...props.sx }}>
      {isEasSupported ? (
        <>
          {props.tokenCheckInRequirement === 0 && props.address === address && (
            <AccountActivityCardActionsCheckInEasButton
              address={props.address}
              tokenId={props.tokenId}
              onCheckedIn={props.onCheckedIn}
            />
          )}
          {props.tokenCheckInRequirement === 1 && (
            <AccountActivityCardActionsCheckInEasButton
              address={props.address}
              tokenId={props.tokenId}
              onCheckedIn={props.onCheckedIn}
            />
          )}
        </>
      ) : (
        <>
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
        </>
      )}
      <Link href={`/activities/share/${props.address}`}>
        <MediumLoadingButton variant="outlined">📢 Share</MediumLoadingButton>
      </Link>
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

function AccountActivityCardActionsCheckInEasButton(props: {
  address: `0x${string}`;
  tokenId: bigint;
  onCheckedIn: () => void;
}) {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const signer = useSigner();

  async function checkIn() {
    try {
      setIsCheckingIn(true);
      if (!signer) {
        throw new Error("You need to connect your wallet");
      }
      // Init eas
      const EASContractAddress = chainToSupportedChainConfig(chain).eas
        .contract as `0x${string}`;
      const eas = new EAS(EASContractAddress);
      eas.connect(signer);
      // Prepare data
      const schemaEncoder = new SchemaEncoder("uint256 tokenId");
      const encodedData = schemaEncoder.encodeData([
        { name: "tokenId", value: props.tokenId, type: "uint256" },
      ]);
      // Send transaction
      const tx = await eas.attest({
        schema: chainToSupportedChainConfig(chain).eas
          .schemaUid as `0x${string}`,
        data: {
          recipient: props.address,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });
      await tx.wait();
      // Process success
      showToastSuccess("Activity is checked in");
      props.onCheckedIn();
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsCheckingIn(false);
    }
  }

  return (
    <MediumLoadingButton
      variant="contained"
      loading={isCheckingIn}
      disabled={isCheckingIn}
      onClick={() => checkIn()}
    >
      ✅ Check In (EAS)
    </MediumLoadingButton>
  );
}

function AccountActivityCardCalendar(props: {
  tokenColor: bigint;
  tokenCheckIns: readonly bigint[];
  tokenEasCheckIns: number[];
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
    for (const checkIn of [...props.tokenCheckIns, ...props.tokenEasCheckIns]) {
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
  }, [props.tokenCheckIns, props.tokenEasCheckIns]);

  return (
    <Box sx={{ ...props.sx }}>
      {config ? (
        <CalendarHeatmap
          startDate={config.startDate}
          endDate={config.endDate}
          values={config.values}
          titleForValue={(value) => {
            if (!value) {
              return "no check-ins";
            }
            return `${value.count} check-ins on ${value.date}`;
          }}
          classForValue={(value) => {
            if (!value) {
              return "color-empty";
            }
            if (value.count === 1) {
              return `color-${Number(props.tokenColor)}-scale-1`;
            }
            return `color-${Number(props.tokenColor)}-scale-n`;
          }}
        />
      ) : (
        <FullWidthSkeleton />
      )}
    </Box>
  );
}

function AccountActivityCardReactions(props: {
  tokenId: bigint;
  sx?: SxProps;
}) {
  return (
    <Stack spacing={1} sx={{ ...props.sx }}>
      <AccountActivityCardReaction
        tokenId={props.tokenId}
        reactionId={0}
        reactionTitle="🤘 It’s inspiring!"
      />
      <AccountActivityCardReaction
        tokenId={props.tokenId}
        reactionId={1}
        reactionTitle="🤯 You are crazy!"
      />
    </Stack>
  );
}

function AccountActivityCardReaction(props: {
  tokenId: bigint;
  reactionId: number;
  reactionTitle: string;
}) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define token reactions
   */
  const { data: tokenReactions, refetch: refetchTokenReactions } =
    useContractRead({
      address: chainToSupportedChainConfig(chain).contracts.activity,
      abi: activityContractAbi,
      functionName: "getReactions",
      args: [props.tokenId, BigInt(props.reactionId)],
    });

  if (tokenReactions) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Display button if reaction is not added by account */}
        {address && !tokenReactions.includes(address) ? (
          <AccountActivityCardReactionAddButton
            tokenId={props.tokenId}
            reactionId={props.reactionId}
            reactionTitle={props.reactionTitle}
            onAdded={() => refetchTokenReactions()}
          />
        ) : (
          <MediumLoadingButton variant="contained" disabled={true}>
            {props.reactionTitle}
          </MediumLoadingButton>
        )}
        <Typography variant="h6" color={orange[500]} fontWeight={700}>
          {tokenReactions.length}
        </Typography>
      </Stack>
    );
  }

  return <FullWidthSkeleton />;
}

function AccountActivityCardReactionAddButton(props: {
  tokenId: bigint;
  reactionId: number;
  reactionTitle: string;
  onAdded: () => void;
}) {
  const { chain } = useNetwork();
  const { showToastSuccess } = useToasts();

  /**
   * Contract states
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "addReaction",
    args: [props.tokenId, BigInt(props.reactionId)],
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
      showToastSuccess("Reaction is added");
      props.onAdded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  return (
    <MediumLoadingButton
      variant="outlined"
      loading={isButtonLoading}
      disabled={isButtonDisabled}
      onClick={() => contractWrite?.()}
      sx={{
        color: orange[500],
        borderColor: orange[500],
        "& .MuiButton-startIcon svg path": {
          stroke: orange[500],
        },
        "&:hover": {
          color: orange[300],
          borderColor: orange[300],
        },
      }}
    >
      {props.reactionTitle}
    </MediumLoadingButton>
  );
}
