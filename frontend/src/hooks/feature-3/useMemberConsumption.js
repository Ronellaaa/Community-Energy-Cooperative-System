import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchConsumptionRecord,
  fetchMemberConsumptionRecords,
  submitPaymentSlip,
} from "../../services/feature-3/memberConsumptionApi";
import { fetchCurrentUser } from "../../services/feature-3/currentUserApi";

const defaultUploadForm = {
  amountPaid: "",
  paymentDate: "",
  referenceNumber: "",
  payerName: "",
  notes: "",
  slipFile: null,
};

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const getSlipActionLabel = (record) => {
  if (record.paymentStatus === "paid") return "Paid";
  if (record.latestPaymentSlip?.status === "pending") return "Slip Submitted";
  if (record.latestPaymentSlip?.status === "approved") return "Paid";
  if (record.latestPaymentSlip?.status === "rejected") return "Upload Again";
  return "Upload Payment Slip";
};

export const useMemberConsumption = ({
  isUploadMode,
  uploadConsumptionId,
  navigate,
}) => {
  const [memberId, setMemberId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState("");
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadForm, setUploadForm] = useState(defaultUploadForm);
  const hasAutoLoaded = useRef(false);

  const totalAmountOwed = useMemo(
    () => records.reduce((sum, record) => sum + Number(record.amountOwed || 0), 0),
    [records],
  );

  const handleSearch = async () => {
    setError("");
    setSearched(true);

    const normalizedMemberId = memberId.trim();
    const normalizedCommunityId = communityId.trim();

    if (!normalizedMemberId || !normalizedCommunityId) {
      setError("Member ID and Community ID are required.");
      setRecords([]);
      return;
    }

    setLoading(true);

    try {
      setRecords(
        await fetchMemberConsumptionRecords({
          memberId: normalizedMemberId,
          communityId: normalizedCommunityId,
        }),
      );
    } catch (requestError) {
      setError(requestError.message || "Failed to fetch member consumption details");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUploadTarget = async (consumptionId) => {
    setUploadLoading(true);
    setError("");

    try {
      const record = await fetchConsumptionRecord(consumptionId);
      const storedUser = parseStoredUser();

      setUploadTarget(record);
      setUploadForm({
        amountPaid: String(record.amountOwed || ""),
        paymentDate: new Date().toISOString().slice(0, 10),
        referenceNumber: "",
        payerName: storedUser.name || "",
        notes: "",
        slipFile: null,
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment record");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    const syncCurrentUser = async () => {
      const storedUser = parseStoredUser();
      const initialMemberId = storedUser.memberId || storedUser.id || "";
      const initialCommunityId = storedUser.communityId || "";

      if (initialMemberId) setMemberId(String(initialMemberId));
      if (initialCommunityId) setCommunityId(String(initialCommunityId));

      if (initialMemberId || initialCommunityId) {
        setAutoFillNotice("We auto-filled your details from the current login session.");
      }

      try {
        const currentUser = await fetchCurrentUser();

        if (currentUser.id) {
          localStorage.setItem("user", JSON.stringify(currentUser));
        }

        if (currentUser.memberId) {
          setMemberId(String(currentUser.memberId));
        }

        if (currentUser.communityId) {
          setCommunityId(String(currentUser.communityId));
          setAutoFillNotice("We refreshed your member and community details from your current account.");
        }
      } catch {
        // Keep the page usable with the login snapshot when a live refresh is unavailable.
      }
    };

    syncCurrentUser();
  }, []);

  useEffect(() => {
    if (hasAutoLoaded.current) return;
    if (!memberId.trim() || !communityId.trim() || isUploadMode) return;

    hasAutoLoaded.current = true;
    handleSearch();
  }, [memberId, communityId, isUploadMode]);

  useEffect(() => {
    if (!isUploadMode || !uploadConsumptionId) {
      setUploadTarget(null);
      setUploadMessage("");
      return;
    }

    loadUploadTarget(uploadConsumptionId);
  }, [isUploadMode, uploadConsumptionId]);

  const handleUploadFieldChange = ({ name, value }) => {
    setUploadForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUploadFileChange = (file) => {
    setUploadForm((current) => ({
      ...current,
      slipFile: file,
    }));
  };

  const handleUploadSubmit = async () => {
    setError("");
    setUploadMessage("");

    const storedUser = parseStoredUser();

    if (!storedUser.id) {
      setError("A logged-in user is required to upload a payment slip.");
      return false;
    }

    if (!uploadTarget?._id) {
      setError("No payment record selected.");
      return false;
    }

    if (!uploadForm.slipFile) {
      setError("Please choose a payment slip image or PDF.");
      return false;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "paymentSlipData",
        JSON.stringify({
          memberConsumptionId: uploadTarget._id,
          userId: storedUser.id,
          amountPaid: Number(uploadForm.amountPaid),
          paymentDate: uploadForm.paymentDate,
          referenceNumber: uploadForm.referenceNumber,
          payerName: uploadForm.payerName,
          notes: uploadForm.notes,
        }),
      );
      formData.append("slipImage", uploadForm.slipFile);

      setUploadMessage(await submitPaymentSlip(formData));
      setTimeout(() => {
        navigate("/feature-3/member-consumption");
      }, 1000);
      return true;
    } catch (requestError) {
      setError(requestError.message || "Failed to upload payment slip");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  return {
    memberId,
    setMemberId,
    communityId,
    setCommunityId,
    records,
    loading,
    error,
    searched,
    autoFillNotice,
    uploadTarget,
    uploadLoading,
    uploadMessage,
    uploadForm,
    totalAmountOwed,
    handleSearch,
    handleUploadFieldChange,
    handleUploadFileChange,
    handleUploadSubmit,
  };
};
