import {
  getPreviousReading,
  getPreviousReadingDetails,
  saveReading,
  getReadingsByPeriod,
  getMemberHistory,
  getMemberHistoryByCommunity,
  getReadingByPeriod,
  updateReadingById,
  patchReadingById,
  patchReadingByPeriod as patchReadingByPeriodService,
  deleteReadingById,
  deleteReadingsByPeriod as deleteReadingsByPeriodService,
  getReadingById as getReadingByIdService,
} from "../../service/feature-3/manager.reading.service.js";

// Submit a reading
export const submitReading = async (req, res) => {
  try {
    const {
      memberId,
      communityId,
      currentReading,
      month,
      year,
      previousReading: manualPreviousReading,
    } = req.body;

    // Validate required fields
    if (!memberId || !communityId || !currentReading || !month || !year) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Get previous reading
    const previousReadingFromHistory = await getPreviousReading(
      memberId,
      communityId,
      month,
      year,
    );
    const hasManualPreviousReading =
      manualPreviousReading !== undefined &&
      manualPreviousReading !== null &&
      manualPreviousReading !== "";
    const previousReading =
      previousReadingFromHistory ??
      (hasManualPreviousReading ? Number(manualPreviousReading) : null);

    if (previousReading === null) {
      return res.status(400).json({
        error: "No previous record found. Please provide initial reading.",
      });
    }

    // Validate reading is increasing
    if (currentReading < previousReading) {
      return res.status(400).json({
        error: "Current reading cannot be less than previous reading",
      });
    }

    // Save the reading
    const consumption = await saveReading({
      memberId,
      communityId,
      currentReading,
      month,
      year,
      previousReading,
    });

    res.status(201).json({
      success: true,
      data: consumption,
      message: `Recorded ${consumption.unitsConsumed} units consumed`,
    });
  } catch (error) {
    console.error("Error submitting reading:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getPreviousReadingLookup = async (req, res) => {
  try {
    const { memberId, communityId, month, year } = req.params;

    const details = await getPreviousReadingDetails(
      memberId,
      communityId,
      parseInt(month, 10),
      parseInt(year, 10),
    );

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("Error fetching previous reading:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get readings for a billing period
export const getReadings = async (req, res) => {
  try {
    const { communityId, month, year } = req.params;

    const readings = await getReadingsByPeriod(
      communityId,
      parseInt(month),
      parseInt(year),
    );

    res.json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error("Error fetching readings:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get member reading history
export const getHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    const history = await getMemberHistory(memberId);

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMemberCommunityHistory = async (req, res) => {
  try {
    const { memberId, communityId } = req.params;

    const history = await getMemberHistoryByCommunity(memberId, communityId);

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching member community history:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Submit initial reading for new member ---------------------------!!!!!!!!!!
export const submitInitialReading = async (req, res) => {
  try {
    const { memberId, communityId, initialReading, month, year } = req.body;

    // Check if reading already exists
    const existing = await getReadingByPeriod(
      memberId,
      communityId,
      month,
      year,
    );

    if (existing !== null) {
      return res.status(400).json({
        error: "Reading already exists for this period",
      });
    }

    // Save initial reading (previous = current)
    const consumption = await saveReading({
      memberId,
      communityId,
      currentReading: initialReading,
      month,
      year,
      previousReading: initialReading,
    });

    res.status(201).json({
      success: true,
      data: consumption,
      message: "Initial reading recorded successfully",
    });
  } catch (error) {
    console.error("Error submitting initial reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ GET - Get single reading by ID ============
export const getReadingById = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await getReadingByIdService(id);

    if (!reading) {
      return res.status(404).json({
        error: "Reading not found",
      });
    }

    res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error("Error fetching reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ PUT - Full update ============
export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { previousReading, currentReading, amountOwed, paymentStatus } =
      req.body;

    // Validate required fields for full update
    if (previousReading === undefined || currentReading === undefined) {
      return res.status(400).json({
        error: "previousReading and currentReading are required",
      });
    }

    // Calculate units consumed
    const unitsConsumed = currentReading - previousReading;

    if (unitsConsumed < 0) {
      return res.status(400).json({
        error: "Current reading cannot be less than previous reading",
      });
    }

    const updatedReading = await updateReadingById(id, {
      previousReading,
      currentReading,
      unitsConsumed,
      amountOwed: amountOwed || 0,
      paymentStatus: paymentStatus || "pending",
    });

    if (!updatedReading) {
      return res.status(404).json({
        error: "Reading not found",
      });
    }

    res.json({
      success: true,
      data: updatedReading,
      message: "Reading updated successfully",
    });
  } catch (error) {
    console.error("Error updating reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ PATCH - Partial update by ID ============
export const patchReading = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get existing reading first
    const existingReading = await getReadingByIdService(id);

    if (!existingReading) {
      return res.status(404).json({
        error: "Reading not found",
      });
    }

    // If currentReading is updated, recalculate unitsConsumed
    if (updateData.currentReading !== undefined) {
      const previousReading =
        updateData.previousReading !== undefined
          ? updateData.previousReading
          : existingReading.previousReading;

      updateData.unitsConsumed = updateData.currentReading - previousReading;

      if (updateData.unitsConsumed < 0) {
        return res.status(400).json({
          error: "Current reading cannot be less than previous reading",
        });
      }
    }

    const updatedReading = await patchReadingById(id, updateData);

    res.json({
      success: true,
      data: updatedReading,
      message: "Reading patched successfully",
    });
  } catch (error) {
    console.error("Error patching reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ PATCH - Partial update by member and period ============
export const patchReadingByPeriod = async (req, res) => {
  try {
    const { memberId, communityId, month, year } = req.params;
    const updateData = req.body;

    // Get existing reading
    const existingReading = await getReadingByPeriod(
      memberId,
      communityId,
      parseInt(month, 10),
      parseInt(year, 10),
    );

    if (!existingReading) {
      return res.status(404).json({
        error: "Reading not found for this member and period",
      });
    }

    // If currentReading is updated, recalculate unitsConsumed
    if (updateData.currentReading !== undefined) {
      const previousReading =
        updateData.previousReading !== undefined
          ? updateData.previousReading
          : existingReading.previousReading;

      updateData.unitsConsumed = updateData.currentReading - previousReading;

      if (updateData.unitsConsumed < 0) {
        return res.status(400).json({
          error: "Current reading cannot be less than previous reading",
        });
      }
    }

    const updatedReading = await patchReadingByPeriodService(
      memberId,
      communityId,
      parseInt(month, 10),
      parseInt(year, 10),
      updateData,
    );

    res.json({
      success: true,
      data: updatedReading,
      message: "Reading patched successfully",
    });
  } catch (error) {
    console.error("Error patching reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ DELETE - Delete single reading ============
export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReading = await deleteReadingById(id);

    if (!deletedReading) {
      return res.status(404).json({
        error: "Reading not found",
      });
    }

    res.json({
      success: true,
      data: deletedReading,
      message: "Reading deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reading:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ============ DELETE - Delete all readings for a period ============
export const deleteReadingsByPeriod = async (req, res) => {
  try {
    const { communityId, month, year } = req.params;

    const result = await deleteReadingsByPeriodService(
      communityId,
      parseInt(month),
      parseInt(year),
    );

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} readings for ${month}/${year}`,
    });
  } catch (error) {
    console.error("Error deleting readings:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
