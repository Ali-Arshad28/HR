import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BaseUrl, config, inputStyle } from '../../../constants';
import Toast from '../../../UIModules/Toast/Toast';
import ReactPaginate from 'react-paginate';
import axios from 'axios';

const PayRoll = () => {

    // const [employees, setEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [showApproveSalaryModal, setShowApproveSalaryModal] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [empDetail, setEmpDetail] = useState({})
    const [incrementAmount, setIncrementAmount] = useState('');
    const [dep, setDep] = useState([])
    const [jobPositions, setJobPositions] = useState([])
    const [AttforPayRoll, setAttforPayroll] = useState([])

    // const fetchData = async () => {
    //     try {
    //         const response = await axios.get(BaseUrl + '/getEmployeesforPayRoll', config);
    //         console.log(response.data);
    //         setEmployees(response.data);
    //     } catch (error) {
    //         console.error('Error fetching roles :', error);
    //         Toast('Error catch :', 'error');
    //     }
    // };

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
    const fetchData3 = async () => {
        try {
            const response = await axios.get(BaseUrl + '/getEmployees', config);
            setAllEmployees(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching roles :', error);
            Toast('Error catch :', 'error');
        }
    };
    const fetchData4 = async () => {
        try {
            const response = await axios.get(BaseUrl + '/AttforPayRoll');
            setAttforPayroll(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching payroll Attendance :', error);
            Toast('Error catch :', 'error');
        }
    };


    useEffect(() => {
        // fetchData();
        fetchData1();
        fetchData2();
        fetchData3();
        fetchData4();
    }, [])

    const handleSalaryApprove = async (calculated) => {
        console.log(empDetail.emp_id, empDetail.netSalary);
        const response = await axios.post(BaseUrl + '/approveSalary', { empId: empDetail.emp_id, empSal: empDetail.netSalary }, config);
        if (response.data.success) {
            Toast(`${response.data.message}`)
        } else {
            Toast(`${response.data.message}`, 'error')
        }
        await fetchData3();
        setShowApproveSalaryModal(false)
    }

    const handleCalculatedSalaryApprove = async () => {
        console.log(empDetail.emp_id, empDetail.netSalary);

       const filteredEmp=AttforPayRoll.find((emp) => emp.emp_id === empDetail.emp_id);
       const calculatedSalary=(((empDetail.netSalary)/22)*filteredEmp.present_days).toFixed(0);
        console.log(calculatedSalary);
        const response = await axios.post(BaseUrl + '/approveSalary', { empId: empDetail.emp_id, empSal: calculatedSalary }, config);
        if (response.data.success) {
            Toast(`${response.data.message}`)
        } else {
            Toast(`${response.data.message}`, 'error')
        }
        await fetchData3();
        setShowApproveSalaryModal(false)
    }

    const handlePromotion = async (updatedSalary) => {
        console.log(updatedSalary, empDetail.emp_id);
        const response = await axios.post(BaseUrl + '/updateSalary', { updatedSalary, empId: empDetail.emp_id }, config)
        if (response.data.success) {
            Toast(`${response.data.message}`)
        } else {
            Toast(`${response.data.message}`, 'error')
        }
        await fetchData3();
        setIncrementAmount('')
        setShowPromotionModal(false);
    };
    // ------------------------------------------------------------------------------------------------


    const [filters, setFilters] = useState({
        employeeName: '',
        department: '',
        jobPosition: '',
        empId: '',
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const filteredEmployees = allEmployees
        .filter((emp) => emp?.name?.toLowerCase()?.includes(filters.employeeName.toLowerCase()))
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

    const checker = () => {
        return filteredEmployees.find(emp => { return emp?.salary_status == null });
    }
    const handleApproveAllClick = async () => {

        const filteremp = filteredEmployees.filter(emp => { return emp?.salary_status == null });
        const unPaidEmployees = filteremp.map(({ emp_id, netSalary }) => ({ emp_id, netSalary }));
        console.log(unPaidEmployees);
        try {
            const response = await axios.post(BaseUrl + '/ApproveAllSalaries', { unPaidEmployees });
            if (response.data.success) {
                Toast(`${response.data.message}`);
            }
            else {
                Toast(`${response.data.message}`, 'error');
            }
        } catch (e) {
            Toast(`${e}`, 'error')
            console.log(e);

        }
        console.log(unPaidEmployees);
        await fetchData3();

    }
    // ------------------------------------------------------------------------------------------------

    console.log('allEmployees : ', allEmployees);
    return (
        <div id="full-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="mb-4">Payroll Management</h2>
<div id="content">
            <div style={{ display: 'flex', flex: '1', gap: '20px', width: "100%", margin: '10px auto' }}>
                <input
                    type="text"
                    style={{ ...inputStyle, WebkitAppearance: 'none' }}
                    id="employeeNameFilter"
                    placeholder="Search by Employee Name"
                    className="form-control round"
                    value={filters.employeeName}
                    onChange={(e) => handleFilter('employeeName', e.target.value)}
                />
                <select
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

                <select
                    value={filters.jobPosition}
                    autoComplete='off'
                    className={`form-control round`}
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
            {checker() &&
                <button className="btn btn-primary mb-3" style={{ alignSelf: 'end' }} onClick={handleApproveAllClick}>
                    Approve All Net Salaries
                </button>}
            <table style={{textAlign:'center'}} className="table table-striped">
                <thead>
                    <tr style={{ borderBottom: '3px solid white', fontSize:"17px", fontWeight:'bolder'}}> 
                        <th>Name</th>
                        <th>Department</th>
                        <th>Job Position</th>
                        <th>Basic Salary</th>
                        <th>Performance Score (%)</th>
                        <th>Bonus</th>
                        <th>Tax</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentEmployees.map((employee) => (
                        <tr key={employee.emp_id}>
                            <td>{employee?.name}</td>
                            <td>{employee?.dep_name}</td>
                            <td>{employee?.job_name}</td>
                            <td>{employee?.salary ? `${employee.salary.toString().slice(0, -3)} PKR` : 'N/A'}</td>

                            {/* <td>{employee?.performanceScore}</td>
                            <td>{employee?.performanceScore === 100 ? `$${(employee.salary * 0.02)}` : 'N/A'}</td>
                            <td>{employee?.salary ? calculateTax(employee.salary) : 'N/A'}</td>
                            <td>{calculateCellValue(employee)}</td> */}

                            <td>{employee.performanceScore}</td>
                            <td>{Math.floor(employee.Bonus)}</td>
                            <td>{Math.floor(employee.Tax)}</td>
                            <td>{Math.floor(employee.netSalary)}</td>

                            <td>{employee.salary_status === 'Paid'
                                ? (<span className="badge bg-success">Paid</span>)
                                : (<span className="badge bg-warning">Not Paid</span>)}
                            </td>
                            <td>
                                <button className="btn btn-primary btn-sm me-2" onClick={() => {
                                    setShowPromotionModal(true)
                                    setEmpDetail({ ...employee });
                                }}
                                    style={{ marginBottom: '5px' }}
                                >
                                    Increase Salary
                                </button>
                                {employee.salary_status == null && <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                        setShowApproveSalaryModal(true);
                                        setEmpDetail({ ...employee });
                                    }}
                                >
                                    Approve Salary
                                </button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', margin: '10px auto', gap: '5px' }}>
                <select
                    name="itemsPerPage"
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

            {/* Promotion Modal */}
            <Modal show={showPromotionModal} onHide={() => setShowPromotionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Promote Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="currentSalary" className="form-label">Employee Name:</label>
                        <input
                            type="name  "
                            className="form-control"
                            id="name"
                            value={empDetail.name}
                            disabled
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="currentSalary" className="form-label">Current Basic Salary:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="currentSalary"
                            value={empDetail && empDetail.salary ? empDetail.salary.toString().slice(0, -3) + " PKR" : ''}
                            disabled
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="currentJobPosition" className="form-label">Current Job Position:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={empDetail.job_name}
                            id="currentJobPosition"
                            disabled
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="incrementAmount" className="form-label">Increment Amount:</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="incrementAmount"
                            value={incrementAmount}
                            onChange={(e) => setIncrementAmount(e.target.value)}
                        />
                    </div>
                    {incrementAmount && <div>
                        Updated Salary= {empDetail.salary.toString().slice(0, -3)}+{incrementAmount}= {Number(empDetail.salary) + Number(incrementAmount)} PKR
                    </div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowPromotionModal(false) }}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => { handlePromotion(Number(empDetail.salary) + Number(incrementAmount)) }}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Approve Modal */}
            <Modal show={showApproveSalaryModal} onHide={() => setShowApproveSalaryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Approve Salary</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to approve the salary of {empDetail.name}?
                    <br />
                    Net Salary = {Math.floor(empDetail.netSalary)}/month
                    {AttforPayRoll.filter((emp) => emp.emp_id === empDetail.emp_id).map((filteredEmp) => (
                        <div key={filteredEmp.emp_id}>
                            Current Month Presents: {filteredEmp.present_days}
                            <br />
                            Current Month Absents: {filteredEmp.absent_days}
                            <br />
                            Current Month Leaves: {filteredEmp.leave_days}
                            <br />
                            Calculated Salary on the base of Working Days: {((empDetail.netSalary/22)*filteredEmp.present_days).toFixed(0)} 
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApproveSalaryModal(false)}>
                        No
                    </Button>
                    <Button variant="primary" onClick={()=>{handleSalaryApprove()}}>
                        Approve Net Salary
                    </Button>
                    <Button variant="primary" onClick={()=>{handleCalculatedSalaryApprove()}}>
                        Approve Calculated Salary
                    </Button>
                </Modal.Footer>
            </Modal>
</div>
        </div >
    );
};

export default PayRoll;
