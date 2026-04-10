import { useCallback, useState } from "react";
import {
  createMeterReading,
  deleteMeterReading,
  lookupPreviousMeterReading,
  updateMeterReading,
} from "../../services/feature-3/meterReadingApi";

const now = new Date();

export const useMeterReadingPage = () => {
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [status, setStatus] = useState({ type: "", message: "" });

  const lookupPreviousReading = useCallback(async (payload) => {
    return lookupPreviousMeterReading(payload);
  }, []);

  const handleSubmit = async (payload) => {
    setStatus({ type: "", message: "" });
    const result = await createMeterReading(payload);
    setStatus({ type: "success", message: result.message });
    return result.data;
  };

  const handleUpdate = async (id, payload) => {
    setStatus({ type: "", message: "" });
    const result = await updateMeterReading(id, payload);
    setStatus({ type: "success", message: result.message });
    return result.data;
  };

  const handleDelete = async (id) => {
    setStatus({ type: "", message: "" });
    const result = await deleteMeterReading(id);
    setStatus({ type: "success", message: result.message });
    return result.data;
  };

  return {
    month,
    setMonth,
    year,
    setYear,
    status,
    lookupPreviousReading,
    handleSubmit,
    handleUpdate,
    handleDelete,
  };
};
