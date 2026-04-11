import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchConsumptionRecord,
  fetchMemberConsumptionRecords,
  submitPaymentSlip,
  updatePaymentSlip,
  deletePaymentSlip,
  getPaymentSlip,
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
  uploadPaymentSlipId,
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

  const loadUploadTarget = async (consumptionId, paymentSlipId = "") => {
    setUploadLoading(true);
    setError("");

    try {
      const [record, existingPaymentSlip] = await Promise.all([
        fetchConsumptionRecord(consumptionId),
        paymentSlipId ? getPaymentSlip(paymentSlipId).then((response) => response.data) : Promise.resolve(null),
      ]);
      const storedUser = parseStoredUser();

      setUploadTarget({
        ...record,
        paymentSlipId: existingPaymentSlip?._id || "",
        paymentSlipStatus: existingPaymentSlip?.status || "",
        rejectionReason: existingPaymentSlip?.rejectionReason || "",
      });
      setUploadForm({
        amountPaid: String(existingPaymentSlip?.amountPaid ?? record.amountOwed ?? ""),
        paymentDate: existingPaymentSlip?.paymentDate
          ? new Date(existingPaymentSlip.paymentDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        referenceNumber: existingPaymentSlip?.referenceNumber || "",
        payerName: existingPaymentSlip?.payerName || storedUser.name || "",
        notes: existingPaymentSlip?.notes || "",
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

    loadUploadTarget(uploadConsumptionId, uploadPaymentSlipId);
  }, [isUploadMode, uploadConsumptionId, uploadPaymentSlipId]);

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

      const response = await submitPaymentSlip(formData);
      setUploadMessage(response.message || "Payment slip submitted successfully");
      setTimeout(() => {
        handleSearch();
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

  const handleUpdate = async () => {
    setError("");
    setUploadMessage("");

    const storedUser = parseStoredUser();

    if (!storedUser.id) {
      setError("A logged-in user is required to update a payment slip.");
      return false;
    }

    const paymentSlipId = uploadPaymentSlipId || uploadTarget?.paymentSlipId;

    if (!paymentSlipId) {
      setError("No payment slip selected.");
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
      if (uploadForm.slipFile) {
        formData.append("slipImage", uploadForm.slipFile);
      }

      const response = await updatePaymentSlip(paymentSlipId, formData);
      setUploadMessage(response.message || "Payment slip updated successfully");
      setTimeout(() => {
        handleSearch();
        navigate("/feature-3/member-consumption");
      }, 1000);
      return true;
    } catch (requestError) {
      setError(requestError.message || "Failed to update payment slip");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (target = uploadTarget) => {
    setError("");
    setUploadMessage("");

    const paymentSlipId =
      target?.paymentSlipId ||
      target?.latestPaymentSlip?._id ||
      target?._id;

    if (!paymentSlipId) {
      setError("No payment slip selected.");
      return false;
    }

    if (!window.confirm("Are you sure you want to delete this payment slip? This action cannot be undone.")) {
      return false;
    }

    setUploadLoading(true);

    try {
      const response = await deletePaymentSlip(paymentSlipId);
      setUploadMessage(response.message || "Payment slip deleted successfully");
      setTimeout(() => {
        if (!isUploadMode) {
          handleSearch();
        } else {
          handleSearch();
          navigate("/feature-3/member-consumption");
        }
      }, 1000);
      return true;
    } catch (requestError) {
      setError(requestError.message || "Failed to delete payment slip");
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
    handleUpdate,
    handleDelete,
  };
};
