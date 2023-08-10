import FormikHelper from "@/components/helper/FormikHelper";
import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { activityContractAbi } from "@/contracts/abi/acitivtyContract";
import useDebounce from "@/hooks/useDebounce";
import useToasts from "@/hooks/useToast";
import { chainToSupportedChainConfig } from "@/utils/chains";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page to create an activity.
 */
export default function ActivityCreate() {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { showToastSuccess } = useToasts();
  const router = useRouter();

  const activityExamples = ["💻 Programming", "🙌 Helping beginner developers"];

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    description: "",
    checkInRequirement: 0,
    color: 0,
  });
  const formValidationSchema = yup.object({
    description: yup.string().required(),
    checkInRequirement: yup.number().required(),
    color: yup.number().required(),
  });
  const debouncedFormValues = useDebounce(formValues);

  /**
   * Contract states
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.activity,
    abi: activityContractAbi,
    functionName: "create",
    args: [
      debouncedFormValues.description,
      debouncedFormValues.checkInRequirement,
      BigInt(debouncedFormValues.color),
    ],
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
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Activity is created");
      router.push(`/accounts/${address}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  return (
    <Layout maxWidth="xs">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Create an activity
      </Typography>
      <Typography textAlign="center" mt={1}>
        in which you want to be consistent
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={() => contractWrite?.()}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Description */}
            <Autocomplete
              fullWidth
              onChange={(_, value: string) => {
                setValues({
                  ...values,
                  description: value,
                });
              }}
              inputValue={values.description}
              onInputChange={(_, value) => {
                setValues({
                  ...values,
                  description: value,
                });
              }}
              freeSolo
              disableClearable
              options={activityExamples.map((example) => example)}
              disabled={isFormDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="description"
                  name="description"
                  label="Description"
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  multiline
                  maxRows={4}
                />
              )}
              sx={{ mt: 4 }}
            />
            {/* Check-in requirement */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <InputLabel>Who can check in this activity?</InputLabel>
              <Select
                id="checkInRequirement"
                name="checkInRequirement"
                label="Who can check in this activity?"
                value={values.checkInRequirement}
                onChange={handleChange}
                disabled={isFormDisabled}
              >
                <MenuItem value="0">Only me</MenuItem>
                <MenuItem value="1">Everyone</MenuItem>
              </Select>
            </FormControl>
            {/* Color */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <InputLabel>Color</InputLabel>
              <Select
                id="color"
                name="color"
                label="Color"
                value={values.color}
                onChange={handleChange}
                disabled={isFormDisabled}
              >
                <MenuItem value="0">🟢 Green</MenuItem>
                <MenuItem value="1">🔴 Red</MenuItem>
                <MenuItem value="2">🟠 Orange</MenuItem>
              </Select>
            </FormControl>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              loading={isFormLoading}
              variant="outlined"
              type="submit"
              disabled={isFormSubmitDisabled}
              sx={{ mt: 4 }}
            >
              Submit
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}
