import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { config, BaseUrl } from '../../../../constants';
import Toast from '../../../../UIModules/Toast/Toast';
import ReactPaginate from 'react-paginate';
import './AttendanceRecord.css'
import axios from 'axios';

const AttendanceRecord = () => {
  const [attendance, setAttendance] = useState([]);
  useEffect(() => { 
    const fetchData = async () => {
      try {
        const response = await axios.get(BaseUrl + `/attendanceRecord`, config)
        console.log(response.data);
        setAttendance(response.data)
      } catch (error) {
        Toast("Data not Loaded", 'error')
        console.log(error);
      }

    }

    fetchData();
  }, [])

  // ----------------------------------

  const [filters, setFilters] = useState({
    att_date: '',
    status: ''
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  const filteredAttendance = attendance
    .filter((emp) => emp?.status?.toLowerCase()?.includes(filters.status.toLowerCase()))
    .filter((emp) => emp?.attendance_date.includes(filters.att_date))
  console.log('filteredEmployee ', filteredAttendance);

  const offset = currentPage * itemsPerPage;
  const currentAttendance = filteredAttendance.slice(offset, offset + itemsPerPage);


  const handleFilterChange = (filterType, value) => {
    console.log(filterType, value);
    setFilters({ ...filters, [filterType]: value });
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);

  };
  return (
    <div id="full-content" className="container mt-4">
      <h2 className="mb-4">Current Month Attendance Record</h2>
      <div id="content">
        <div style={{ display: 'flex', gap: '10px', margin: '10px 0px' }}>
          <input
            value={'Search Attendance Date'}
            style={{ marginRight: '-10px', paddingLeft: '10px', borderRadius: '5px 0px  0px 5px', outline: 'none', border: 'none', backgroundColor: '#5DBCC2' }}
            disabled

          />
          <input
            type="date"
            placeholder="Search by Employee Name"
            name="att_date"
            value={filters.att_date}
            style={{ borderRadius: '0px 5px 5px 0px' }}

            className="form-control"
            onChange={(e) => handleFilterChange('att_date', e.target.value)}
          />
          <select
            value={filters.status}
            className="form-control round"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Filter by Attendance Status</option>
            <option value={''}>All</option>
            <option value={'Present'}>Present</option>
            <option value={'Absent'}>Absent</option>
            <option value={'Leave'}>Leave</option>
          </select>
        </div>
        <Table style={{textAlign:'center'}} striped bordered hover responsive>
          <thead >
            <tr style={{ borderBottom: '3px solid white', fontSize:"17px", fontWeight:'bolder'}}>
              <th>Attendance ID</th>
              <th>Attendance Date </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentAttendance.map((att) => {
              return <tr>
                <td>{att.attendance_id}</td>
                <td>{att.attendance_date?.slice(0, 10)}</td>
                <td>{att.status}</td>
              </tr>
            })}
          </tbody>
        </Table>
        <div style={{ display: 'flex', margin: '10px auto' }}>
          <select
            name="itemsPerPage"
            style={{ height: '38px', flex: '1', flexBasis: "200px", border: 'none', outline: 'none', borderRadius: '5px', marginRight: '5px' }}
            id="itemsPerPage"
            onChange={handleItemsPerPageChange}
            value={itemsPerPage}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            pageCount={Math.ceil(filteredAttendance.length / itemsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={'pagination'}
            activeClassName={'active'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            breakLabel={<span className="ellipsis">.&ensp;.&ensp;.</span>} // Custom styling for ellipsis
          />


        </div>
      </div >
    </div >

  );
};

export default AttendanceRecord;
