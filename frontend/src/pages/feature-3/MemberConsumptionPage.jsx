import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemberConsumptionListView from "../../components/feature-3/MemberConsumptionListView";
import MemberPaymentSlipUploadView from "../../components/feature-3/MemberPaymentSlipUploadView";
import { useMemberConsumption } from "../../hooks/feature-3/useMemberConsumption";
import "../../styles/feature-3/member-consumption.css";

export default function MemberConsumptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isUploadMode = searchParams.get("mode") === "upload";
  const uploadConsumptionId = searchParams.get("consumptionId") || "";

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
  } = useMemberConsumption({
    isUploadMode,
    uploadConsumptionId,
    navigate,
  });

  const openUploadPage = (record) => {
    navigate(
      `/feature-3/member-consumption?mode=upload&consumptionId=${record._id}`,
    );
  };

  const returnToList = () => {
    navigate("/feature-3/member-consumption");
  };

  if (isUploadMode) {
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
      />
    );
  }

  return (
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
    />
  );
}
