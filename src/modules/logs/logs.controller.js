import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as logsService from './logs.service.js';
import { logAdminActivity } from '../../utils/activityLogger.js';
import { Parser } from 'json2csv';

export const getLogs = asyncHandler(async (req, res) => {
  const result = await logsService.getLogs(req.query);
  return successResponse(res, 200, 'Logs fetched successfully', result);
});

export const getLogById = asyncHandler(async (req, res) => {
  const log = await logsService.getLogById(req.params.id);
  if (!log) {
    return errorResponse(res, 404, 'Log entry not found');
  }
  return successResponse(res, 200, 'Log fetched successfully', log);
});

export const exportLogs = asyncHandler(async (req, res) => {
  const logs = await logsService.getAllFilteredLogsForExport(req.query);
  
  if (!logs || logs.length === 0) {
    return errorResponse(res, 404, 'No logs found to export');
  }

  // Convert to CSV
  const fields = ['id', 'adminId', 'adminEmail', 'action', 'entityType', 'entityId', 'ipAddress', 'status', 'createdAt'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(logs);

  await logAdminActivity(req, {
    action: 'EXPORT_LOGS',
    status: 'SUCCESS'
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('admin-activity-logs.csv');
  return res.send(csv);
});

export const deleteLog = asyncHandler(async (req, res) => {
  const log = await logsService.getLogById(req.params.id);
  if (!log) {
    return errorResponse(res, 404, 'Log entry not found');
  }

  await logsService.deleteLog(req.params.id);

  await logAdminActivity(req, {
    action: 'DELETE',
    entityType: 'AdminActivityLog',
    entityId: parseInt(req.params.id, 10),
    oldValue: log
  });

  return successResponse(res, 200, 'Log entry deleted successfully');
});

export const purgeOldLogs = asyncHandler(async (req, res) => {
  const deletedCount = await logsService.purgeOldLogs(60);

  await logAdminActivity(req, {
    action: 'PURGE_LOGS',
    newValue: { deletedCount }
  });

  return successResponse(res, 200, `Purged ${deletedCount} old log entries successfully`);
});

export const getLogStats = asyncHandler(async (req, res) => {
  const stats = await logsService.getLogStats();
  return successResponse(res, 200, 'Log stats fetched successfully', stats);
});
