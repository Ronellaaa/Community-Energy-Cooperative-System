import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../components/feature-3/BackButton";
import MemberConsumptionListView from "../../components/feature-3/MemberConsumptionListView";
import MemberPaymentSlipUploadView from "../../components/feature-3/MemberPaymentSlipUploadView";
import PaymentSlipDetailsView from "../../components/feature-3/PaymentSlipDetailsView";
import { useMemberConsumption } from "../../hooks/feature-3/useMemberConsumption";
import "../../styles/feature-3/member-consumption.css";

export default function MemberConsumptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isUploadMode = searchParams.get("mode") === "upload";
  const isViewMode = searchParams.get("mode") === "view";
  const uploadConsumptionId = searchParams.get("consumptionId") || "";
  const viewPaymentSlipId = searchParams.get("paymentSlipId") || "";
  const uploadPaymentSlipId = isUploadMode
    ? searchParams.get("paymentSlipId") || ""
    : "";

  const {
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
  } = useMemberConsumption({
    isUploadMode,
    uploadConsumptionId,
    uploadPaymentSlipId,
    navigate,
  });

  const resolveConsumptionId = (record) =>
    record?.memberConsumptionId?._id ||
    record?.memberConsumptionId ||
    record?._id ||
    record?.id ||
    "";

  const openUploadPage = (record, paymentSlipId = "") => {
    const consumptionId = resolveConsumptionId(record);

    if (!consumptionId) {
      navigate("/feature-3/member-consumption");
      return;
    }

    navigate(
      `/feature-3/member-consumption?mode=upload&consumptionId=${consumptionId}${paymentSlipId ? `&paymentSlipId=${paymentSlipId}` : ""}`,
    );
  };

  const openViewPage = (paymentSlipId) => {
    navigate(
      `/feature-3/member-consumption?mode=view&paymentSlipId=${paymentSlipId}`,
    );
  };

  const returnToList = () => {
    navigate("/feature-3/member-consumption");
  };

  if (isUploadMode) {
    if (uploadLoading || !uploadTarget) {
      return (
        <div className="f3mc-message f3mc-info">Loading payment data...</div>
      );
    }
    return (
      <MemberPaymentSlipUploadView
        uploadTarget={uploadTarget}
        uploadLoading={uploadLoading}
        uploadMessage={uploadMessage}
        uploadForm={uploadForm}
        error={error}
        onBack={returnToList}
        onFieldChange={handleUploadFieldChange}
        onFileChange={handleUploadFileChange}
        onSubmit={handleUploadSubmit}
        onUpdate={handleUpdate}
      />
    );
  }

  if (isViewMode && viewPaymentSlipId) {
    return (
      <PaymentSlipDetailsView
        paymentSlip={{ _id: viewPaymentSlipId }}
        onBack={returnToList}
      />
    );
  }

  return (
    <div>
      <BackButton
        className="f3mc-backButton"
        label="Dashboard"
        onClick={() => navigate("/my-community")}
      />
      <MemberConsumptionListView
        memberId={memberId}
        communityId={communityId}
        loading={loading}
        searched={searched}
        records={records}
        autoFillNotice={autoFillNotice}
        error={error}
        totalAmountOwed={totalAmountOwed}
        onMemberIdChange={setMemberId}
        onCommunityIdChange={setCommunityId}
        onSearch={handleSearch}
        onOpenUploadPage={openUploadPage}
        onViewPaymentSlip={openViewPage}
        onDelete={handleDelete}
      />
    </div>
  );
}
