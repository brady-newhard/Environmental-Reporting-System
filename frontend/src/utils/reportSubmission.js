import { submitReport } from '../services/api';

/**
 * Submit a report for lead review
 * @param {Object} reportData - The report data to submit
 * @param {string} reportData.report_type - Type of report (e.g., 'environmental_daily', 'utility_daily')
 * @param {string} reportData.discipline - Discipline (environmental, utility, welding, coating)
 * @param {Object} reportData.data - The actual report data
 * @param {string} reportData.report_id - Optional report ID, will be generated if not provided
 * @returns {Promise<Object>} The submitted report data
 */
export const submitReportForReview = async (reportData) => {
  try {
    const submissionData = {
      report_type: reportData.report_type,
      report_id: reportData.report_id || `${reportData.report_type}_${Date.now()}`,
      discipline: reportData.discipline,
      data: reportData.data,
      status: 'submitted'
    };

    const result = await submitReport(submissionData);
    return result;
  } catch (error) {
    console.error('Error submitting report for review:', error);
    throw error;
  }
};

/**
 * Prepare environmental daily report data for submission
 * @param {Object} formData - The form data from the environmental daily report
 * @returns {Object} Prepared report data
 */
export const prepareEnvironmentalDailyReport = (formData) => {
  // Extract data from the nested structure
  const header = formData.header || {};
  const sections = formData.sections || [];
  const summaries = formData.summaries || {};
  
  // Find weather section
  let weatherSection = null;
  if (Array.isArray(sections)) {
    weatherSection = sections.find(s => s.name && s.name.toLowerCase().includes('weather'));
  }
  const weatherRow = weatherSection && Array.isArray(weatherSection.rows) && weatherSection.rows.length > 0 ? weatherSection.rows[0] : {};
  
  // Find crew summaries section
  let crewSection = null;
  if (Array.isArray(sections)) {
    crewSection = sections.find(s => s.name && s.name.toLowerCase().includes('crew'));
  }
  const crewRow = crewSection && Array.isArray(crewSection.rows) && crewSection.rows.length > 0 ? crewSection.rows[0] : {};
  
  // Find daily progress section
  let progressSection = null;
  if (Array.isArray(sections)) {
    progressSection = sections.find(s => s.name && s.name.toLowerCase().includes('progress'));
  }
  const progressRow = progressSection && Array.isArray(progressSection.rows) && progressSection.rows.length > 0 ? progressSection.rows[0] : {};
  
  return {
    report_type: 'environmental_daily',
    discipline: 'environmental',
    data: {
      // Preserve the original structure for editing
      header: header,
      sections: sections,
      summaries: summaries,
      photos: formData.photos || [],
      signature: formData.signature || '',
      sigDate: formData.sigDate || header.date,
      preparedBy: formData.preparedBy || header.inspector,
      
      // Also include flattened data for backward compatibility
      date: header.date || header.inspection_date,
      location: header.location || header.project,
      facility: header.facility,
      route: header.route,
      spread: header.spread,
      milepost_start: header.milepost_start,
      milepost_end: header.milepost_end,
      station_start: header.station_start,
      station_end: header.station_end,
      contractor: header.contractor,
      inspector: header.inspector,
      
      // Weather data
      weather_conditions: weatherRow.weather_conditions || header.weather_conditions,
      temperature: weatherRow.temperature || header.temperature,
      precipitation_type: weatherRow.precipitation_type || header.precipitation_type,
      soil_conditions: weatherRow.soil_conditions || header.soil_conditions,
      
      // Crew data
      crew: crewRow.Crew,
      foreman: crewRow.Foreman,
      crew_start_station: crewRow['Start Station'],
      crew_end_station: crewRow['End Station'],
      crew_summary: crewRow.Summary,
      
      // Progress data
      progress_phase: progressRow.Phase,
      progress_start_station: progressRow['Start Station'],
      progress_end_station: progressRow['End Station'],
      
      // Other data
      notes: summaries.notes
    }
  };
};

/**
 * Prepare utility daily report data for submission
 * @param {Object} formData - The form data from the utility daily report
 * @returns {Object} Prepared report data
 */
export const prepareUtilityDailyReport = (formData) => {
  return {
    report_type: 'utility_daily',
    discipline: 'utility',
    data: {
      date: formData.date,
      location: formData.location,
      weather_conditions: formData.weather_conditions,
      temperature: formData.temperature,
      humidity: formData.humidity,
      notes: formData.notes,
      contractor: formData.contractor,
      inspections: formData.inspections || [],
      photos: formData.photos || [],
      prepared_by: formData.prepared_by,
      signature: formData.signature,
      signature_date: formData.signature_date
    }
  };
};

/**
 * Prepare utility daily report 2 data for submission
 * @param {Object} formData - The form data from the utility daily report 2
 * @returns {Object} Prepared report data
 */
export const prepareUtilityDailyReport2 = (formData) => {
  return {
    report_type: 'utility_daily_2',
    discipline: 'utility',
    data: {
      header: formData.header,
      headcounts: formData.headcounts,
      subcontractors: formData.subcontractors,
      inspection_personnel: formData.inspectionPersonnel,
      craft: formData.craft,
      environmental: formData.environmental,
      survey: formData.survey,
      land: formData.land,
      morning_temp: formData.morningTemp,
      mid_temp: formData.midTemp,
      weather: formData.weather,
      precipitation: formData.precipitation,
      abnormal_conditions: formData.abnormalConditions,
      crew_adverse: formData.crewAdverse,
      progress_rows: formData.progressRows,
      pay_items: formData.payItems,
      remarks: formData.remarks,
      equipment: formData.equipment,
      trucking: formData.trucking,
      crews: formData.crews,
      photos: formData.photos || [],
      prepared_by: formData.preparedBy,
      signature: formData.signature,
      signature_date: formData.sigDate
    }
  };
};

/**
 * Prepare welding daily report data for submission
 * @param {Object} formData - The form data from the welding daily report
 * @returns {Object} Prepared report data
 */
export const prepareWeldingDailyReport = (formData) => {
  return {
    report_type: 'welding_daily',
    discipline: 'welding',
    data: {
      date: formData.date,
      location: formData.location,
      weather_conditions: formData.weather_conditions,
      temperature: formData.temperature,
      humidity: formData.humidity,
      notes: formData.notes,
      welds_completed: formData.welds_completed,
      welds_inspected: formData.welds_inspected,
      welds_rejected: formData.welds_rejected,
      photos: formData.photos || [],
      prepared_by: formData.prepared_by,
      signature: formData.signature,
      signature_date: formData.signature_date
    }
  };
};

/**
 * Prepare coating daily report data for submission
 * @param {Object} formData - The form data from the coating daily report
 * @returns {Object} Prepared report data
 */
export const prepareCoatingDailyReport = (formData) => {
  return {
    report_type: 'coating_daily',
    discipline: 'coating',
    data: {
      date: formData.date,
      location: formData.location,
      weather_conditions: formData.weather_conditions,
      temperature: formData.temperature,
      humidity: formData.humidity,
      notes: formData.notes,
      coating_applied: formData.coating_applied,
      surface_preparation: formData.surface_preparation,
      quality_checks: formData.quality_checks,
      photos: formData.photos || [],
      prepared_by: formData.prepared_by,
      signature: formData.signature,
      signature_date: formData.signature_date
    }
  };
};

/**
 * Prepare SWPPP report data for submission
 * @param {Object} formData - The form data from the SWPPP report
 * @returns {Object} Prepared report data
 */
export const prepareSWPPPReport = (formData) => {
  return {
    report_type: 'swppp',
    discipline: 'environmental',
    data: {
      // Preserve the original structure for editing
      ...formData,
      
      // Also include flattened data for backward compatibility
      date: formData.date,
      location: formData.location,
      weather_conditions: formData.weather_conditions,
      precipitation: formData.precipitation,
      erosion_controls: formData.erosion_controls,
      sediment_controls: formData.sediment_controls,
      maintenance_activities: formData.maintenance_activities,
      inspections: formData.inspections,
      corrective_actions: formData.corrective_actions,
      photos: formData.photos || [],
      prepared_by: formData.prepared_by,
      signature: formData.signature,
      signature_date: formData.signature_date
    }
  };
};

/**
 * Prepare punchlist report data for submission
 * @param {Object} formData - The form data from the punchlist report
 * @returns {Object} Prepared report data
 */
export const preparePunchlistReport = (formData) => {
  return {
    report_type: 'punchlist',
    discipline: 'environmental',
    data: {
      // Preserve the original structure for editing
      ...formData,
      
      // Also include flattened data for backward compatibility
      title: formData.title,
      date: formData.date,
      location: formData.location,
      items: formData.items || [],
      rain_gauges: formData.rainGauges || [],
      photos: formData.photos || [],
      prepared_by: formData.prepared_by,
      signature: formData.signature,
      signature_date: formData.signature_date
    }
  };
};

/**
 * Prepare pay item report data for submission
 * @param {Object} formData - The form data from the pay item report
 * @returns {Object} Prepared report data
 */
export const preparePayItemReport = (formData) => {
  return {
    report_type: 'pay_item',
    discipline: 'utility',
    data: {
      header: formData.header,
      items: formData.items || [],
      comments: formData.comments,
      photos: formData.photos || [],
      prepared_by: formData.preparedBy,
      signature: formData.signature,
      signature_date: formData.sigDate
    }
  };
};

/**
 * Generic report preparation function that determines the type and calls the appropriate preparer
 * @param {Object} formData - The form data
 * @param {string} reportType - The type of report
 * @returns {Object} Prepared report data
 */
export const prepareReportData = (formData, reportType) => {
  switch (reportType) {
    case 'environmental_daily':
      return prepareEnvironmentalDailyReport(formData);
    case 'utility_daily':
      return prepareUtilityDailyReport(formData);
    case 'utility_daily_2':
      return prepareUtilityDailyReport2(formData);
    case 'welding_daily':
      return prepareWeldingDailyReport(formData);
    case 'coating_daily':
      return prepareCoatingDailyReport(formData);
    case 'swppp':
      return prepareSWPPPReport(formData);
    case 'punchlist':
      return preparePunchlistReport(formData);
    case 'pay_item':
      return preparePayItemReport(formData);
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}; 