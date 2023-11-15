import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl, config, inputStyle } from '../../../../constants';
import '../../BasicStyle.css';
import Toast from '../../../../UIModules/Toast/Toast';
const AttendanceHistory = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    name: '',
    emp_id: '',
    month: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsPerPageOptions = [5, 20, 50, 100];

  const fetchData = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getattendancehistory', config);
      console.log(response);
      console.log(response.data);
      setAttendanceHistory(response.data);
    } catch (error) {
      Toast('Error catch', 'error');
      console.error('Error fetching data attendance history:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    const selectedItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(selectedItemsPerPage);
    setCurrentPage(1);
  };

    const filteredAndSortedAttendanceHistory = attendanceHistory
    .filter((emp) => {
      const { status, date, name, emp_id, month } = filters;
      const dateObject = new Date(emp?.attendance_date.toString());
      const empmonth = dateObject.getMonth() + 1;
      
      return (
        (status === '' || emp.status === status) &&
        (date === '' || emp.attendance_date?.includes(date)) &&
        (emp_id === '' || emp.emp_id.toString().includes(emp_id)) &&
        (name === '' || emp.name?.toLowerCase().includes(name.toLowerCase())) &&
        (month === '' || empmonth === parseInt(month))
      );
    })
  // .sort((a, b) => {
  //   if (sortByDate === 'asc') {
  //     return a.attendance_date?.localeCompare(b.attendance_date) || 0; // Add null/undefined check
  //   } else if (sortByDate === 'desc') {
  //     return b.attendance_date?.localeCompare(a.attendance_date) || 0; // Add null/undefined check
  //   } else {
  //     return 0; // No sorting by date
  //   }
  // });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedAttendanceHistory.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAndSortedAttendanceHistory.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const months = [
    { name: "January", number: 1 },
    { name: "February", number: 2 },
    { name: "March", number: 3 },
    { name: "April", number: 4 },
    { name: "May", number: 5 },
    { name: "June", number: 6 },
    { name: "July", number: 7 },
    { name: "August", number: 8 },
    { name: "September", number: 9 },
    { name: "October", number: 10 },
    { name: "November", number: 11 },
    { name: "December", number: 12 }
  ];


  return (
    <div id="full-content" className="container mt-4">
      <h2 className="mb-4">Employee Attendance History</h2>
      <div id="content">
        <div style={{ display: 'flex', gap: '10px', margin: '0px 10px' }}>
          <input
            type="text"
            placeholder="Search by Employee Name"
            name="name"
            value={filters.name}
            style={{ ...inputStyle }}
            className="form-control"

            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Search by Employee ID"
            style={{ ...inputStyle }}
            className="form-control"
            name="emp_id"
            value={filters.emp_id}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', margin: '10px' }}>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value={''} style={{ display: 'none' }}>Search by Status</option>
            <option value={''}>All</option>
            <option value={'Absent'}>Absent</option>
            <option value={'Leave'}>Leave</option>
            <option value={'Present'}>Present</option>
          </select>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value={''} style={{ display: 'none' }}>Search by Status</option>
            <option value={''}>All</option>
            {months.map((m, index) => { return <option value={m.number} key={m.number}>{++index}. {m.name}</option> })}

          </select>
          <input
            type="date"
            className="form-control"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
          {/* <select
            className="form-control"
            style={{ display: 'inline', width: '475px' }}
            value={sortByDate}
            onChange={handleSortByDateChange}
          >
            <option style={{ display: 'none' }} value="All">Sort By Attendence Date</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select> */}

        </div>

        <table style={{textAlign:'center'}} className="table">
          <thead>
            <tr style={{ borderBottom: '3px solid white', fontSize:"17px", fontWeight:'bolder'}}>
              <th>
                Employee ID
              </th>
              <th>
                Employee Name
              </th>
              <th>Attendence Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((emp, index) => (
              <tr
                key={index}
                className={
                  emp.status === 'Leave'
                    ? 'table-warning'
                    : emp.status === 'Present'
                      ? 'table-success'
                      : 'table-danger'
                }
              >
                <td>{emp.emp_id}</td>
                <td style={{textTransform:"capitalize"}}>{emp.name}</td>
                <td>{emp.attendance_date ? emp.attendance_date.slice(0, 10) : ''}</td>
                <td
                  style={{
                    color:
                      emp.status === 'Leave'
                        ? 'grey'
                        : emp.status === 'Present'
                          ? 'green'
                          : 'red',
                  }}
                >
                  {emp.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', margin: 'auto' }}>
          <select
            style={{ display: 'inline', flex: '0', width: '70px', marginRight: '5px' }}
            className="form-control"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <optgroup label='Items/Page'></optgroup>
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pagination" style={{ flex: "1" }}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              if (
                index === 0 ||                       // Always show the first page
                index === totalPages - 1 ||          // Always show the last page
                Math.abs(currentPage - (index + 1)) <= 1  // Show 1 page before and 1 page after the current page
              ) {
                return (
                  <button
                    key={index}
                    className={`page-link ${index + 1 === currentPage ? 'active-button' : ''}`}
                    style={{
                      backgroundColor: index + 1 === currentPage ? '#007BFF' : 'white',
                      color: index + 1 === currentPage ? 'white' : 'black',
                    }}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                index === 1 && currentPage >= 4 ||
                index === totalPages - 2 && currentPage <= totalPages - 3
              ) {
                return (
                  <span key={index} className="page-link" >
                    . . .
                  </span>
                );
              }
              return null;
            })}
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceHistory;
