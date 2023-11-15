import React from 'react';
import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import './MainContent.css';
import axios from 'axios';
import { BaseUrl, end_time } from '../../../constants';
import { config } from '../../../constants';
import Toast from '../../../UIModules/Toast/Toast';
import { Link } from 'react-router-dom';
// import { config } from '../../../constants';
export default function MainContent() {

  const [stat, setStat] = useState({})
  const fetchData = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getDashboardData', config);
      console.log(response.data);
      setStat(response.data);
    } catch (error) {
      console.log("Error : ", error);
    }
  }

const markAbsent = async () => {
  const response = await axios.post(BaseUrl + '/markAbsent',{},config)
  console.log(response);
  if (!response.data.success) {
    console.log("Absent Marked", "success")
    // window.location.reload()
  }
}

// time related info
const [currentTime, setCurrentTime] = useState();
const handleTimeChanges = () => {
  setCurrentTime(() => {
    const currentTime = new Date();

    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const second = currentTime.getSeconds();

    return `${ hour }:${ minute }:${ second }`;
  });
};

useEffect(() => {
  const intervalId = setInterval(() => {
    handleTimeChanges();
  }, 1000);
  return () => {
    clearInterval(intervalId);
  };
}, []);

const [record, setRecord] = useState()

useEffect(() => {
  const time = new Date();
  console.log(time);
  console.log("End : " + end_time)
  console.log(`${ time.getHours() }:${ time.getMinutes() }:${ time.getSeconds() }` );
  
  // DELETE FROM attendance WHERE attendance_date = DATE(NOW()) AND status = 'Absent';

  // Getting current time when Dashboard Render
  if (`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}` >= end_time && `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}` <= '18:0:0'  ) {
  console.log('markab1');
  markAbsent()
  console.log('markab2');

}
fetchData()
}, [])
  return (
    <div class="col main pt-3 mt-3" id="dashboard">
      <Navbar type={"dashboard"} />
      <p class="lead d-none d-sm-block mb-2 "><h1 className="dashboard-title">HR Dashboard</h1></p>
      <div className="container mt-2">
        <div className="row mb-3">
          <Link className="col-xl-3 col-sm-6 py-2 link"  to="/hrdash/manageEmployee">
            <div className="card bg-primary text-white h-80" style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-primary"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate" >
                  <i className="fa fa-users fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Total Employees</h6>
                <h4 className="display-4">{stat.totalEmployees}</h4>
                {/* <h1 className="display-4">{parseInt(stat.totalEmployees,10)-1}</h1> */}
              </div>
            </div>
          </Link>
          <Link  to="/hrdash/viewDepartment" className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-white bg-success h-80"  style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-warning" style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                  <i className="fas fa-building fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Total Departments</h6>
                <h1 className="display-4">{stat.totalDepartments}</h1>
              </div>
            </div>
          </Link>
          <Link to={'/hrdash/postJob'} className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-white bg-secondary h-80" style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-secondary"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                  <i className="fas fa-briefcase fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Total Jobs Available</h6>
                <h1 className="display-4">{stat.totalJobs}</h1>
              </div>
            </div>
          </Link>
          <Link to={'/hrdash/viewApplications'} className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-white bg-warning h-80"  style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-dark"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                  <i className="fa fa-calendar-alt fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Applications Recieved</h6>
                <h1 className="display-4">{stat.totalApplications}</h1>
              </div>
            </div>
          </Link>
          <Link to={'/hrdash/todayAttendance'} className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-light bg-warning h-80"  style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-success"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                <i className="fa fa-check-circle fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Today Presents</h6>
                <h1 className="display-4">{stat.totalPresent}</h1>
              </div>
            </div>
          </Link>
          <Link to={'/hrdash/todayAttendance'} className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-white bg-warning h-80"  style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-danger"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                <i className="fa fa-times-circle fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Today Absents</h6>
                <h1 className="display-4">{stat.totalAbsent}</h1>
              </div>
            </div>
          </Link>
          <Link to={'/hrdash/todayAttendance'} className="col-xl-3 col-sm-6 py-2 link">
            <div className="card text-white bg-warning h-80"  style={{border:'white 1px solid',borderRadius:'20px'}}>
              <div className="card-body bg-info"  style={{border:'white 1px solid',borderRadius:'20px', backgroundColor: "#428bca" }}>
                <div className="rotate">
                <i className="fa fa-times-circle fa-4x"></i>
                </div>
                <h6 className="text-uppercase">Today Leave</h6>
                <h1 className="display-4">{stat.totalLeave}</h1>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>

  )
}

// -------------------------------------------------------------------------------------------------

// import React from 'react';
// import { useEffect, useState } from 'react';
// import './MainContent.css';
// import Navbar from '../Navbar';
// import axios from 'axios';
// import { BaseUrl, config, end_time} from '../../../constants';
// import Toast from '../../../UIModules/Toast/Toast';
// export default function MainContent() {

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(BaseUrl + '/getDashboardData',config);

//       const {
//         no_of_absent_employees,
//         no_of_employees,
//         no_of_leave_employees,
//         no_of_present_employees
//       } = response.data[0]

//       setStat({
//         absent: no_of_absent_employees,
//         present: no_of_present_employees,
//         leave: no_of_leave_employees,
//         total: no_of_employees,
//       })

//       console.log(stat);

//     } catch (error) {
//       console.log(error);
//     }
//   }

//   const markAbsent = async () => {
//     const response = await axios.post(BaseUrl + '/markAbsent')
//     console.log(response);
//     if (!response.data.success) {
//       Toast("Absent Marked", "success")
//       // window.location.reload()
//     }
//   }

//   // time related info
//   const [currentTime, setCurrentTime] = useState();
//   const handleTimeChanges = () => {
//     setCurrentTime(() => {
//       const currentTime = new Date();

//       const hour = currentTime.getHours();
//       const minute = currentTime.getMinutes();
//       const second = currentTime.getSeconds();

//       return `${ hour }:${ minute }:${ second }`;
//     });
//   };

//   useEffect(() => {
//     // fetchData();

//     // Time
//     const intervalId = setInterval(() => {
//       handleTimeChanges();
//     }, 1000);

//     // Clean up
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, []);

//   const [record, setRecord] = useState()

//   const [stat, setStat] = useState({
//     absent: "",
//     present: "",
//     leave: "",
//     total: ""
//   })

//   useEffect(() => {
//     // fetching data from backend

//     const time = new Date()

//     console.log("Current : " + record);
//     console.log("End : " + end_time)

//     // Getting current time when Dashboard Render
//     if (`${ time.getHours() }:${ time.getMinutes() }:${ time.getSeconds() }` >= end_time) {
//     markAbsent()
//   }

//   fetchData()
// }, [])


// return (
//   <div class="col main pt-3 mt-3" id="dashboard">

//     <Navbar type={"dashboard"} />
//     <p class="lead d-none d-sm-block mb-4"><h2>Dashboard</h2></p>
//     <div className="container mt-4">
//       <div className="row mb-3">
//         <div className="col-xl-3 col-sm-6 py-2">
//           <div className="card bg-primary text-white h-100">
//             <div className="card-body bg-primary" style={{ backgroundColor: "#428bca" }}>
//               <div className="rotate">
//                 <i className="fa fa-users fa-4x"></i>
//               </div>
//               <h6 className="text-uppercase">Total Employees</h6>
//               <h1 className="display-4">{stat.total}</h1>
//             </div>
//           </div>
//         </div>
//         <div className="col-xl-3 col-sm-6 py-2">
//           <div className="card text-white bg-success h-100">
//             <div className="card-body bg-success">
//               <div className="rotate">
//                 <i className="fa fa-check-circle fa-4x"></i>
//               </div>
//               <h6 className="text-uppercase">Today's Presents</h6>
//               <h1 className="display-4">{stat.present}</h1>
//             </div>
//           </div>
//         </div>
//         <div className="col-xl-3 col-sm-6 py-2">
//           <div className="card text-white bg-danger h-100">
//             <div className="card-body bg-danger">
//               <div className="rotate">
//                 <i className="fa fa-times-circle fa-4x"></i>
//               </div>
//               <h6 className="text-uppercase">Today's Absents</h6>
//               <h1 className="display-4">{stat.absent}</h1>
//             </div>
//           </div>
//         </div>
//         <div className="col-xl-3 col-sm-6 py-2">
//           <div className="card text-white bg-warning h-100">
//             <div className="card-body bg-warning">
//               <div className="rotate">
//                 <i className="fa fa-calendar-alt fa-4x"></i>
//               </div>
//               <h6 className="text-uppercase">Today's Leave</h6>
//               <h1 className="display-4">{stat.leave}</h1>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>

// )
// }