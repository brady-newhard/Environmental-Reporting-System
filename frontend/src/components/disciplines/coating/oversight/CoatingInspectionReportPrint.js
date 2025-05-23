import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ReportPrintTemplate from '../../../common/ReportPrintTemplate';

const CoatingInspectionReportPrint = () => {
  const location = useLocation();
  const report = location.state?.report;

  if (!report) return <div>No report data provided.</div>;

  const renderRows = (rows, renderFn, emptyRowFn) => {
    if (rows && rows.length > 0) return rows.map(renderFn);
    return [emptyRowFn()];
  };

  const sections = [
    {
      header: 'Project Information',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Contractor</TableCell>
                <TableCell>{report.contractor}</TableCell>
                <TableCell>Report #</TableCell>
                <TableCell>{report.reportNumber}</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>{report.date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Project No./WBS</TableCell>
                <TableCell>{report.projectNo}</TableCell>
                <TableCell>QC Inspector Start/Stop Time</TableCell>
                <TableCell>{report.inspectorTime}</TableCell>
                <TableCell>Crew Start/Stop Time</TableCell>
                <TableCell>{report.crewTime}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Facility ID</TableCell>
                <TableCell>{report.facilityId}</TableCell>
                <TableCell>General Location</TableCell>
                <TableCell colSpan={3}>{report.location}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OQ Personnel</TableCell>
                <TableCell colSpan={5}>{report.oqPersonnel}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 1A – Ambient Conditions',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Weather</TableCell>
                <TableCell>Wind MPH</TableCell>
                <TableCell>DB °F</TableCell>
                <TableCell>WB °F</TableCell>
                <TableCell>RH %</TableCell>
                <TableCell>Steel Temp</TableCell>
                <TableCell>Dew Pt</TableCell>
                <TableCell>+/-</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
              {renderRows(
                report.ambientRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.weather}</TableCell>
                    <TableCell>{row.wind}</TableCell>
                    <TableCell>{row.db}</TableCell>
                    <TableCell>{row.wb}</TableCell>
                    <TableCell>{row.rh}</TableCell>
                    <TableCell>{row.temp}</TableCell>
                    <TableCell>{row.dew}</TableCell>
                    <TableCell>{row.plusminus}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={11} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 1B – Surface Preparation (Hold Point)',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Surface Cleanliness</TableCell>
                <TableCell>Specified</TableCell>
                <TableCell>Actual</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
              {renderRows(
                report.surfaceRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.no}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.cleanliness}</TableCell>
                    <TableCell>{row.specified}</TableCell>
                    <TableCell>{row.actual}</TableCell>
                    <TableCell>{row.profile}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 1C – Surface Preparation Checklist',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Checklist Item</TableCell>
                <TableCell align="center">YES</TableCell>
                <TableCell align="center">NO</TableCell>
                <TableCell align="center">N/A</TableCell>
              </TableRow>
              {renderRows(
                report.checklist,
                (item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell align="center">{item.yes ? '✔' : ''}</TableCell>
                    <TableCell align="center">{item.no ? '✔' : ''}</TableCell>
                    <TableCell align="center">{item.na ? '✔' : ''}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 2A – Coating Application',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Coating Type/Product ID</TableCell>
                <TableCell>Mix#</TableCell>
                <TableCell>Application Method</TableCell>
                <TableCell>Begin</TableCell>
                <TableCell>End</TableCell>
                <TableCell>WFT Mils</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
              {renderRows(
                report.coatingAppRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.no}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.mix}</TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell>{row.begin}</TableCell>
                    <TableCell>{row.end}</TableCell>
                    <TableCell>{row.wft}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 2B – Mixing Report',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Mix #</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Shelf Life Sat.</TableCell>
                <TableCell>Comp A Batch #</TableCell>
                <TableCell>Comp B Batch #</TableCell>
                <TableCell>Mat. T °F</TableCell>
                <TableCell>Time of Mix</TableCell>
                <TableCell>Act Induct Time</TableCell>
                <TableCell>Pot Life (hr)</TableCell>
                <TableCell>Qty (gal)</TableCell>
                <TableCell>Witnessed</TableCell>
              </TableRow>
              {renderRows(
                report.mixingRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.mix}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.color}</TableCell>
                    <TableCell>{row.shelf}</TableCell>
                    <TableCell>{row.compA}</TableCell>
                    <TableCell>{row.compB}</TableCell>
                    <TableCell>{row.matTemp}</TableCell>
                    <TableCell>{row.mixTime}</TableCell>
                    <TableCell>{row.induct}</TableCell>
                    <TableCell>{row.potLife}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.witnessed}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={13} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 2C – Coating Application Checklist',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Checklist Item</TableCell>
                <TableCell align="center">YES</TableCell>
                <TableCell align="center">NO</TableCell>
                <TableCell align="center">N/A</TableCell>
              </TableRow>
              {renderRows(
                report.coatingChecklist,
                (item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell align="center">{item.yes ? '✔' : ''}</TableCell>
                    <TableCell align="center">{item.no ? '✔' : ''}</TableCell>
                    <TableCell align="center">{item.na ? '✔' : ''}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 3A – Dry Film Thickness (Hold Point)',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Specified (mils)</TableCell>
                <TableCell>Average (mils)</TableCell>
                <TableCell>Range (mils)</TableCell>
                <TableCell>Rework Required</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
              {renderRows(
                report.dftRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.no}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.specified}</TableCell>
                    <TableCell>{row.average}</TableCell>
                    <TableCell>{row.range}</TableCell>
                    <TableCell>{row.rework}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 3B – Holiday Inspection (Hold Point)',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Stage</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Number of Holidays</TableCell>
                <TableCell>Holiday Detection Voltage</TableCell>
                <TableCell>Material Used for Repairs</TableCell>
                <TableCell>Cure Test Shore D Hardness Reading</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
              {renderRows(
                report.holidayRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.numHolidays}</TableCell>
                    <TableCell>{row.voltage}</TableCell>
                    <TableCell>{row.materialUsed}</TableCell>
                    <TableCell>{row.shoreD}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 3C – Backfill & Rock Shield',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Was backfill used?</TableCell>
                <TableCell>{report.backfill}</TableCell>
                <TableCell>Was Rock Shield used?</TableCell>
                <TableCell>{report.rockShield}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 3D – Instrument Record',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Instrument</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Calibrated Yes</TableCell>
                <TableCell>Calibrated No</TableCell>
                <TableCell>Calibrated N/A</TableCell>
              </TableRow>
              {renderRows(
                report.instrumentRows,
                (row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.instrument}</TableCell>
                    <TableCell>{row.brand}</TableCell>
                    <TableCell>{row.serial}</TableCell>
                    <TableCell align="center">{row.yes ? '✔' : ''}</TableCell>
                    <TableCell align="center">{row.no ? '✔' : ''}</TableCell>
                    <TableCell align="center">{row.na ? '✔' : ''}</TableCell>
                  </TableRow>
                ),
                () => (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No data</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
    {
      header: 'Section 3E – Additional Comments',
      content: (
        <div style={{ padding: 8, border: '1px solid #222', minHeight: 40 }}>{report.comments}</div>
      ),
    },
    {
      header: 'Section 4 – Comments / Signatures',
      content: (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Contractor QC Inspector Name</TableCell>
                <TableCell>{report.qcInspector.name}</TableCell>
                <TableCell>NACE #</TableCell>
                <TableCell>{report.qcInspector.nace}</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>{report.qcInspector.date}</TableCell>
                <TableCell>Signature</TableCell>
                <TableCell>
                  {report.qcInspector.signature
                    ? <img src={report.qcInspector.signature} alt="QC Signature" style={{ width: 120, height: 40 }} />
                    : <span>_________________________</span>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Client Rep Name</TableCell>
                <TableCell>{report.clientRep.name}</TableCell>
                <TableCell>NACE #</TableCell>
                <TableCell>{report.clientRep.nace}</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>{report.clientRep.date}</TableCell>
                <TableCell>Signature</TableCell>
                <TableCell>
                  {report.clientRep.signature
                    ? <img src={report.clientRep.signature} alt="Client Signature" style={{ width: 120, height: 40 }} />
                    : <span>_________________________</span>}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
  ];

  return (
    <ReportPrintTemplate
      title="Coating Inspection Report"
      sections={sections}
    />
  );
};

export default CoatingInspectionReportPrint; 