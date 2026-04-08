import express from 'express';
import { 
  submitReading,           // POST - Create new reading
  submitInitialReading,    // POST - Create initial reading
  getPreviousReadingLookup,// GET - Get previous reading details
  getReadings,             // GET - Get all readings for a period
  getHistory,              // GET - Get member history
  getMemberCommunityHistory,
  getReadingById,          // GET - Get single reading by ID
  updateReading,           // PUT - Full update
  patchReading,            // PATCH - Partial update
  patchReadingByPeriod,    // PATCH - Partial update by member and period
  deleteReading,           // DELETE - Delete a reading
  deleteReadingsByPeriod   // DELETE - Delete all readings for a period
} from '../../controllers/feature-3/manager.meterReading.js';

const router = express.Router();

// ============ POST (Create) ============
// POST /api/readings - Submit a reading
router.post('/readings', submitReading);

// POST /api/readings/initial - Submit initial reading for new member
router.post('/readings/initial', submitInitialReading);


// ============ GET (Read) ============
// GET /api/readings/previous/:memberId/:communityId/:month/:year - Get previous reading details
router.get('/readings/previous/:memberId/:communityId/:month/:year', getPreviousReadingLookup);

// GET /api/readings/:communityId/:month/:year - Get all readings for a period
router.get('/readings/:communityId/:month/:year', getReadings);

// GET /api/readings/member/:memberId - Get reading history for a member
router.get('/readings/member/:memberId', getHistory);

// GET /api/readings/member/:memberId/community/:communityId - Get reading history for a member within a community
router.get('/readings/member/:memberId/community/:communityId', getMemberCommunityHistory);

// GET /api/readings/:id - Get single reading by ID
router.get('/readings/:id', getReadingById);


// ============ PUT (Full Update) ============
// PUT /api/readings/:id - Full update of a reading
router.put('/readings/:id', updateReading);


// ============ PATCH (Partial Update) ============
// PATCH /api/readings/:id - Partial update (e.g., fix a mistake)
router.patch('/readings/:id', patchReading);

// PATCH /api/readings/:memberId/:communityId/:month/:year - Partial update by member and period
router.patch('/readings/:memberId/:communityId/:month/:year', patchReadingByPeriod);


// ============ DELETE (Delete) ============
// DELETE /api/readings/:id - Delete a single reading
router.delete('/readings/:id', deleteReading);

// DELETE /api/readings/:communityId/:month/:year - Delete all readings for a period
router.delete('/readings/:communityId/:month/:year', deleteReadingsByPeriod);

export default router;
