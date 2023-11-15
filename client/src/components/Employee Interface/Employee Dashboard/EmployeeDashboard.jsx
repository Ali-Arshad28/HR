import React from 'react';
import { Link } from "react-router-dom";
import axios from 'axios'
import { useState, useEffect } from 'react';
import { BaseUrl } from '../../../constants';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../UIModules/Toast/Toast';
import { config } from '../../../constants';


export default function EmployeeDashboard() {

  const [empStats, setEmpStats] = useState({})
  const [empDashStats, setEmpDashStats] = useState({})
  const [salDet, setSalDet] = useState({})
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const response = await axios.post(BaseUrl + '/getEmpInfobyEmpId', {}, config);
      console.log(response.data);
      setEmpStats(response.data);
    } catch (error) {
      console.log("Error : ", error);
    }
  };
  const fetchData2 = async () => {
    try {
      const response = await axios.post(BaseUrl + '/getempdashStats', {}, config);
      setEmpDashStats(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("Error : ", error);
    }
  };
  const fetchData3 = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getSalaryDetailforEmp', config);
      setSalDet(response.data[0]);
      console.log(response.data[0]);
    } catch (error) {
      console.log("Error : ", error);
    }
  };


  useEffect(() => {
    fetchData();
    fetchData2();
    fetchData3();
  }, [])


  const handleLogout = async () => {
    try {
      const response = await axios.get(BaseUrl + '/logout');
      if (response.data.success) {
        Toast("You're Logout")
        navigate('/Login')
      }
      else {
        Toast("Issue Occured")
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div class="col main pt-2 mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" >Home</a></li>

          <li className="breadcrumb-item ml-auto">
            <button className="btn btn-danger logout" onClick={handleLogout}>
              Logout
            </button>
          </li>

        </ol>
      </nav>
      <h2 className="dashboard-title">Employee Dashboard</h2>
      <div className="row mb-3">
        <div className="col-xl-4 col-sm-6 py-2" >
        <Link to={'/empdash/viewProfile'}>

            <div className="card-body bg-primary link" style={{ height: "100%", color: "white", backgroundColor: "#428bca", border:'white 1px solid',borderRadius:'20px' }}>
              <div className="rotate">
                <i class="fa fa-user fa-4x" aria-hidden="true"></i>
              </div>
              <h2 style={{textTransform: "capitalize"}}>{empStats.name}</h2>  
            </div>
            </Link>

        </div>

        <div className="col-xl-4 col-sm-8 py-2">
            <div className="card-body bg-warning" style={{border:'white 1px solid',borderRadius:'20px', color:"white"}}>
              <div className="rotate">
                <i class="fas fa-chart-bar fa-4x"></i>
              </div>
              <h3>Performance Score <br/> {((Number(100-(((empDashStats.absent_count) / 22)) * 100))).toFixed(2)}</h3>
            </div>
          </div>
        <div className="col-xl-4 col-sm-6 py-2">
            <div className="card-body bg-info" style={{border:'white 1px solid',borderRadius:'20px', color:"white"}}>
              <div className="rotate">
                <i class="fas fa-credit-card fa-4x"></i>
              </div>
              <h3>Salary/month  <br/><strong>{empStats.netSalary}</strong></h3>
            </div>
          </div>
        <div className="col-xl-4 col-sm-6 py-2">
        <Link to={'/empdash/AttendanceRecord'}>
            <div className="card-body bg-success link" style={{border:'white 1px solid',borderRadius:'20px', color:"white"}}>
              <div className="rotate">
                <i className="fa fa-check-circle fa-4x"></i>              </div>
              <h3>This Month Presents <strong>{empDashStats.present_count}</strong></h3>
            </div>
            </Link>
          </div>
        <div className="col-xl-4 col-sm-6 py-2">
        <Link to={'/empdash/AttendanceRecord'}>
            <div className="card-body bg-danger link" style={{border:'white 1px solid',borderRadius:'20px', color:"white"}}>
              <div className="rotate">
                <i className="fa fa-times-circle fa-4x"></i>
              </div>
              <h3>This Month Absents <strong>{empDashStats.absent_count}</strong></h3>
            </div>
            </Link>
          </div>
        <div className="col-xl-4 col-sm-6 py-2">
        <Link to={'/empdash/AttendanceRecord'}>

            <div className="card-body bg-secondary link" style={{border:'white 1px solid',borderRadius:'20px', color:"white"}}>
              <div className="rotate">
                <i class="fa fa-times-circle fa-4x"></i>
              </div>
              <h3>This Month Leaves <strong>{empDashStats.leave_count}</strong></h3>
            </div>    
            </Link>
          </div>
        <div className="col-xl-8 col-sm-8 py-2" style={{margin:'auto'}}>
            <div className="card-body" style={{width: "35rem", textAlign:"center", backgroundColor: 'white', padding:"4px" , fontSize:"8px", margin:'auto', border:'black 1.5px solid',borderRadius:'20px' }}>
{salDet.salary_status == "Paid" ? <> <h5 style={{display:'inline'}}>Current Month Salary Status</h5><span style={{marginLeft: "8px", fontSize:'20px'}} className='badge bg-success'>{salDet.salary_status}</span>
                <h6>Salary Approval Date : <strong>{salDet?.salary_date?.slice(0, 10)}</strong></h6>
                <h6>Amount Paid : <strong>{salDet.salary_amount}</strong></h6></>
                : <><h6 style={{display:'inline'}}>Current Month Salary Status</h6><span style={{marginLeft: "8px", fontSize:'20px'}} className='badge bg-danger'>{salDet.salary_status}</span></>}</div>
          </div>

      </div>
    </div>
  );
}
