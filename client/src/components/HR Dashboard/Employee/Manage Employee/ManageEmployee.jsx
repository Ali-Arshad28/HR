import React from 'react'
//import { withRouter } from 'react-router-dom'; // Import withRouter from react-router-dom

import { useHistory } from 'react-router-dom'; // Import useHistory
import { useState, useEffect, useRef } from 'react';
import { BaseUrl, config, inputStyle } from './../../../../constants.js';
// import '../../BasicStyle.css'
import { Modal, Button, Form } from 'react-bootstrap';
import {Link as RouterLink} from "react-router-dom"; 
import {useNavigate } from 'react-router-dom';

import axios from 'axios'
import Toast from '../../../../UIModules/Toast/Toast';
import ReactPaginate from 'react-paginate';
import { Table } from 'react-bootstrap';
// import'./ManageEmployee.css';
import styles from './ManageEmployee.module.css'
import ReactToPrint from 'react-to-print';
const ManageEmployee = () => {

  const [employees, setEmployees] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [dep, setDep] = useState([])
  const [jobPositions, setJobPositions] = useState([])
  const [empId, setEmpId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  let componentRef = useRef();
  const [experienceConfirmation, setExperienceConfirmation] = useState(false)
  const [experienceData, setExperienceData] = useState(`
Experience Letter
Date: ${currentDate}
             This is to certify that Mr/Ms [employee name] has worked with our company as an [Job Title] in our [department name] department from [hiring date] to ${currentDate}.
During the period he/she worked with the company we found him/her to be hardworking and sincere resource. We wish him all the best in his future professional endeavors.

Muhammad Ihtisham
Lead Talent Acquisition
`);

  const handlePrint = () => {
    const printableContent = document.querySelector(".printable-content"); // Replace with an appropriate class or ID
    if (printableContent) {
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
          </head>
          <body>
            ${printableContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      printWindow.close();
      setExperienceConfirmation(false)
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getEmployees', config);
      setEmployees(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching roles :', error);
      Toast('Error catch :', 'error');
    }
  };

  const fetchData1 = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getJobPositions', config);
      setJobPositions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data jobpositons:', error);
    }
  };
  const fetchData2 = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getDepartment');
      setDep(response.data);
    } catch (error) {
      console.error('Error fetching data dep :', error);

    }
  };
  useEffect(() => {
    fetchData();
    fetchData1();
    fetchData2();
  }, [])

  // ------------------------------------------------------------------------------------------------

  const [filters, setFilters] = useState({
    employeeName: '',
    department: '',
    gender: '',
    jobPosition: '',
    empId: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredEmployees = employees
    .filter((emp) => emp?.name?.toLowerCase()?.includes(filters.employeeName.toLowerCase()))
    .filter((emp) => emp?.gender.includes(filters.gender))
    .filter((emp) => emp?.job_name?.toLowerCase()?.includes(filters.jobPosition.toLowerCase()))
    .filter((emp) => emp?.dep_name?.toLowerCase()?.includes(filters.department.toLowerCase()))
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
  // ------------------------------------------------------------------------------------------------
  const handleRemoveEmployee = async () => {
    console.log(empId);
    try {
      const response = await axios.post(BaseUrl + '/removeEmployee', { emp_id: empId }, config)
      if (response.data.success) {
        Toast(`${response.data.message}`, 'success')
        setShowConfirmation(false);
        await fetchData();
      }
      else {
        Toast(`${response.data.message}`, "error")
        console.log("Error occured", response.data.message);
        setShowConfirmation(false);
      }
    } catch (e) {
      console.log(e);
    }
    setShowConfirmation(false);
  };
  const [isColumnOpen, setIsColumnOpen] = useState(false);

  const toggleColumn = () => {
    setIsColumnOpen(!isColumnOpen);
  };

   // Define the openProfileModal function
   const openProfileModal = (employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  //const history = useHistory(); // Use the useHistory hook to access the history object
  const navigate = useNavigate(); // Use the useNavigate hook for navigation

  const openProfilePage = (employee) => {
    navigate("/hrdash/manageEmployee/employeeProfile", { state: { employee : employee } });
    //navigate(`/hrdash/manageEmployee/employeeProfile`);

  };
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <div id="full-content" className={`${styles.container} full-co`}>
      <h2 className="mb-4">Manage Employee</h2>
      <div id='content'>
 <div style={{ display: 'flex', gap: '10px', marginBottom:'-5px' }}>
        <input
            type="text"
            style={{ ...inputStyle, marginBottom: '5px', WebkitAppearance: 'none' }}
            id="employeeNameFilter"
            placeholder="Search by Employee Name"
            className="form-control round"
            value={filters.employeeName}
            onChange={(e) => handleFilter('employeeName', e.target.value)}
          />{/*
          <select
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            value={filters.department}
            className="form-control round"
            onChange={(e) => handleFilter('department', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Department</option>
            <option value={''}>All</option>
            {dep.map((department) => (
              <option value={department.dep_name} key={department.dep_name}>
                {department.dep_name}
              </option>
            ))}
            </select>*/}
          <select
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            value={filters.gender}
            className="form-control round"
            style={{cursor:'pointer'}}
            onChange={(e) => handleFilter('gender', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Gender</option>
            <option value={''}>All</option>
            <option value={'Male'}>Male</option>
            <option value={'Female'}>Female</option>
          </select>
          <select
            value={filters.jobPosition}
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            autoComplete='off'
            className={`form-control round ${styles.searchin}`}
            style={{cursor:'pointer'}}
            onChange={(e) => handleFilter('jobPosition', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Job Position</option>
            <option value={''}>All</option>

            {jobPositions.map((job) => (
              <option value={job.job_name} key={job.job_name}>
                {job.job_name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems:'flex-start', marginTop: '10px', gap: '680px' }}>
        <select
            // style={{ ...inputStyle, WebkitAppearance: 'none' }}
            style={{marginBottom: '10px', width:'33.5%', cursor:'pointer'}}
            value={filters.department}
            className="form-control round"
            onChange={(e) => handleFilter('department', e.target.value)}
          >
            <option value={''} style={{ display: 'none' }}>Department</option>
            <option value={''}>All</option>
            {dep.map((department) => (
              <option value={department.dep_name} key={department.dep_name}>
                {department.dep_name}
              </option>
            ))}
          </select>
          {/*<Button onClick={toggleColumn} style={{position:'absolute', marginLeft:'880px', paddingRight:'15px', fontWeight: 'bolder' }} >
            {isColumnOpen ? ' << ' : '>>'}
            </Button>*/}
        </div>

        <Table style={{ textAlign: 'center', height: 'auto' }} striped bordered hover responsive className="custom-scrollbar-table">
  <thead className={`${styles.header}`}>
    <tr style={{ borderBottom: '3px solid white', fontSize: "17px", fontWeight: 'bolder' }}>
      <th style={{ width: '65px' }}>Emp ID</th>
      <th style={{ width: '130px' }}>Name</th>
      <th style={{ width: '200px' }}>Department</th>
      <th style={{ width: '130px' }}>Job Position</th>
      <th style={{ width: '270px' }}>Actions</th>
      <th style={{ width: '150px' }}>View Full Profile</th>
    </tr>
  </thead>
  <tbody>
    {currentEmployees.map(employee => (
      <>
        <tr key={employee.emp_id}>
          <td>{employee.emp_id}</td>
          <td style={{textTransform: "capitalize"}}>{employee.name}</td>
          <td>{employee.dep_name}</td>
          <td>{employee.job_name}</td>
          <td style={{width: "20%"}}>
            <div >
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '170px', marginBottom:"2px"}}
                onClick={() => {
                  setEmpId(employee.emp_id);
                  setExperienceData((prevData) => {
                    return prevData.replace('[employee name]', employee.name)
                      .replace('[Job Title]', employee.job_name)
                      .replace('[department name]', employee.dep_name)
                      .replace('[hiring date]', employee?.hire_date?.slice(0, 10));
                  });
                  setExperienceConfirmation(true);
                }}
              >
                Experience Letter
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ width: '170px' }}
                onClick={() => {
                  setEmpId(employee.emp_id);
                  setShowConfirmation(true);
                }}
              >
                Terminate
              </button>
            </div>
          </td>
          <td>
 
          <button
  type="button"
  className="btn btn-primary"
 onClick={() => {
    if (employee && employee.emp_id) {
     // openProfileModal(employee);
     openProfilePage(employee);
    }
  }}
>
  View Profile
</button>


          </td>
        </tr>
      </>
    ))}
  </tbody>
</Table>

<Modal show={showProfileModal} onHide={closeProfileModal}>
  <Modal.Header closeButton>
    <Modal.Title>Employee Profile</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedEmployee && (
      <div class="modal-content" style={{padding:"30px", textAlign:"center", fontSize:"19px", border:"2px solid blue"}}>
        <div>
        <p><strong>Emp ID:</strong> {selectedEmployee.emp_id}</p>
        <p><strong>Name:</strong> {selectedEmployee.name}</p>
        <p><strong>Email:</strong> {selectedEmployee.email}</p>
        <p><strong>Gender:</strong> {selectedEmployee.gender}</p>
        <p><strong>Department:</strong> {selectedEmployee.dep_name}</p>
</div>
<div>
        <p><strong>Job Position:</strong> {selectedEmployee.job_name}</p>
        <p><strong>Phone Number:</strong> {selectedEmployee.phone_number}</p>
        <p><strong>Salary:</strong> {selectedEmployee?.salary?.toString()?.slice(0, -3)} PKR</p>
        <p><strong>Hire Date:</strong> {selectedEmployee?.hire_date?.toString()?.slice(0, 10)}</p>

      </div>

        {/* Include additional fields as needed */}
      </div>
    )}
  </Modal.Body>
</Modal>



        <div style={{ display: 'flex', alignItems: 'center', margin: '10px  auto' }}>
          <select
            name="itemsPerPage"
            style={{ width: '100px', flex: '0', border: 'none', outline: 'none', marginTop: '-20px', marginRight: '10px' }}
            id="itemsPerPage"
            className="form-control round"
            onChange={handleItemsPerPageChange}
            value={itemsPerPage}
          >
            <optgroup label='Items/Page'></optgroup>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <ReactPaginate
            style={{ flex: '1' }}
            previousLabel={'Previous'}
            nextLabel={'Next'}
            pageCount={Math.ceil(filteredEmployees.length / itemsPerPage)} // Use filteredApplications.length
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={'pagination'}
            activeClassName={'active'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
          />
        </div>

        {/* Confirmation Modal */}
        <Modal
          show={showConfirmation}
          backdrop="static" // Prevents clicking outside the modal from closing it
          keyboard={false}
          onHide={() => { setShowConfirmation(false) }}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Removal</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to remove this employee?  <br /> Because it will also remove the Account of Employee.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowConfirmation(false) }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              handleRemoveEmployee()
            }}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={experienceConfirmation} backdrop="static" // Prevents clicking outside the modal from closing it
          keyboard={false}
          onHide={() => { setExperienceConfirmation(false) }}>
          <Modal.Header closeButton>
            <Modal.Title>Experience Letter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea name="" className="printable-content" style={{ outline: 'none', borderRadius: '10px', }} value={experienceData} cols="56" rows="17" onChange={(e) => { setExperienceData(e.target.value) }} >
              This is <strong>bold</strong> text.
              This is <em>italic</em> text.
            </textarea>


            {/* <ExperienceLetter experienceData={experienceData} /> */}
            {/* <div ref={componentRef}>
              <textarea
                className="printable-content"
                style={{ outline: 'none', borderRadius: '10px' }}
                cols="56"
                rows="17"
                value={experienceData}
              />
            </div> */}

          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setExperienceConfirmation(false)
                window.location.reload()
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              Print
            </Button>
            {/* <ReactToPrint
              trigger={() => (
                <button className="btn btn-primary">Print Experience Letter</button>
              )}
              content={() => componentRef.current} // Reference to the ExperienceLetter component
            /> */}
          </Modal.Footer>
        </Modal>

      </div>

    </div>
  );
};

export default ManageEmployee;