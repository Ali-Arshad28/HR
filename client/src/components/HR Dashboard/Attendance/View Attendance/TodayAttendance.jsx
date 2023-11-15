import React, { useState, useEffect } from 'react';
import { BaseUrl, config, inputStyle } from '../../../../constants';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import Toast from '../../../../UIModules/Toast/Toast';
import ReactPaginate from 'react-paginate';

const TodayAttendance = () => {
  const [todayAllAttendance, setTodayAllAttendance] = useState([]);


  const fetchData = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getTodayAllAttendance', config);
      setTodayAllAttendance(response.data);
    } catch (error) {
      Toast('catch Error', 'error')
      console.error('Error fetching data jobpositions:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  // ----------------------------------

  const [filters, setFilters] = useState({
    empId: '',
    employeeName: '',
    department: '',
    gender: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredEmployees = todayAllAttendance
    // .filter((emp) => emp.emp_id === filters.empId)
    .filter((emp) => emp.emp_id.toString().includes(filters.empId.toString()))
    .filter((emp) => emp?.name?.toLowerCase()?.includes(filters.employeeName.toLowerCase()))
    .filter((emp) => emp?.gender.includes(filters.gender))
    .filter((emp) => emp?.dep_name?.toLowerCase()?.includes(filters.department.toLowerCase()))
    .filter((emp) => emp?.status?.toLowerCase()?.includes(filters.status.toLowerCase()))
  const offset = currentPage * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(offset, offset + itemsPerPage);

  console.log('filteredEmployee ', filteredEmployees);
  const handleFilter = (filterType, value) => {
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
      <h2 className="mb-4">Today's Attendance</h2>
      <div id="content">

        <div style={{ display: 'flex', gap: '20px' }}>
          <select
            value={filters.department}
            className="form-control round"
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            onChange={(e) => handleFilter('department', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Search by Department</option>
            <option value={''}>All</option>
            {todayAllAttendance.map((department) => (
              <option value={department.dep_name} key={department.dep_name}>
                {department.dep_name}
              </option>
            ))}
          </select>
          <select
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            value={filters.gender}
            className="form-control round"
            onChange={(e) => handleFilter('gender', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Search by Gender</option>
            <option value={''}>All</option>
            <option value={'Male'}>Male</option>
            <option value={'Female'}>Female</option>
          </select>
          <select
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            value={filters.status}
            className="form-control round"
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Status</option>
            <option value={''}>All</option>
            <option value={'Present'}>Present</option>
            <option value={'Absent'}>Absent</option>
            <option value={'Leave'}>Leave</option>

           {/* {todayAllAttendance.map((att, index) => { return <option key={index} value={att.status}>{att.status}</option> })}*/}
          </select>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '20px' }}>
          <input
            type="text"
            id="empId"
            placeholder="Search by Employee ID"
            className="form-control round"
            style={{ width: '304px',marginBottom: '10px',...inputStyle, WebkitAppearance: 'none' }}
            value={filters.empId}
            onChange={(e) => handleFilter('empId', e.target.value)}
          />
          <input
            type="text"
            id="employeeNameFilter"
            placeholder="Search by Employee Name"
            className="form-control round"
            style={{ width: '304px', marginBottom: '10px' ,...inputStyle, WebkitAppearance: 'none'}}
            value={filters.employeeName}
            onChange={(e) => handleFilter('employeeName', e.target.value)}
          />
        </div>


        <table style={{textAlign:'center'}} className="table">
          <thead>
            <tr style={{ borderBottom: '3px solid white', fontSize:"17px", fontWeight:'bolder'}}>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Gender</th>
              <th>Department</th>
              <th>Phone Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map(employee => (
              <tr
                key={employee.emp_id}
                className={employee.status === 'Leave' ? 'table-warning' : employee.status === 'Present' ? 'table-success' : 'table-danger'}
              >
                <td>{employee.emp_id}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.gender}</td>
                <td>{employee.dep_name}</td>
                <td>{employee.phone_number}</td>
                <td style={{ color: employee.status === 'Leave' ? 'grey' : employee.status === 'Present' ? 'green' : 'red' }}>{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ margin: 'auto' ,display:'flex',}}>
        <select
            name="itemsPerPage"
            style={{ width: '100px', marginRight: '5px',flex:'0',border:'none',outline:'none' }}
            id="itemsPerPage"
            className="form-control round"
            onChange={handleItemsPerPageChange}
            value={itemsPerPage}
          >
            <optgroup label='Items/page'></optgroup>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            style={{flex:'1'}}
            pageCount={Math.ceil(filteredEmployees.length / itemsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={"pagination"}
            activeClassName={"active"}
            pageClassName={"page-item"} // Add this class
            pageLinkClassName={"page-link"} // Add this class
            previousClassName={"page-item"} // Add this class
            previousLinkClassName={"page-link"} // Add this class
            nextClassName={"page-item"} // Add this class
            nextLinkClassName={"page-link"} // Add this class
          />
        </div>
      </div>
    </div>
  );
};

export default TodayAttendance;
