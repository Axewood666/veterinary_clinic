const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.use(isAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/appointments-chart', adminController.getAppointmentsChart);
router.get('/dashboard/pets-type-chart', adminController.getPetsTypeChart);
router.get('/dashboard/appointments-status-chart', adminController.getAppointmentsStatusChart);
router.get('/dashboard/vets-workload-chart', adminController.getVetsWorkloadChart);
router.get('/dashboard/recent-activity', adminController.getRecentActivity);

router.get('/settings', adminController.getSettings);
router.post('/settings/general', adminController.updateGeneralSettings);
router.post('/settings/working-hours', adminController.updateWorkingHours);
router.post('/settings/notifications', adminController.updateNotificationSettings);
router.post('/settings/security', adminController.updateSecuritySettings);

module.exports = router; 