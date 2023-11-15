import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../../BasicStyle.css";
import "./MarkAttendance.css";
import Toast from "../../../../UIModules/Toast/Toast";
import { BaseUrl, start_time, end_time } from "../../../../constants";
import axios from "axios";
import { config } from "../../../../constants";
import Clock from './Clock.jsx'
export default function MarkAttendance() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [statOfAtt, setStatOfAtt] = useState('')
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [day] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
  const [leaveInfo, setLeaveInfo] = useState({});
  const [currentTime, setCurrentTime] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveInfo((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const fetchData = async () => {
    try {
      console.log("Date: " + todayDate);
      const response = await axios.post(BaseUrl + "/getAttendencebyEmp", {
        todayDate,
      }, config);
      console.log("Response of data");
      console.log(response?.data[0]?.status);
      setStatOfAtt(response?.data[0]?.status);
      if (response?.data[0]?.status) {
        setAttendanceMarked(true);
      } else {
        setAttendanceMarked(false);
      }
    } catch (error) {
      Toast('catch error', 'error')
      console.error("Error fetching attendence :", error);
    }
  };

  const handleTimeChanges = () => {
    setCurrentTime(() => {
      const currentTime = new Date();

      const hour = currentTime.getHours();
      const minute = currentTime.getMinutes();
      const second = currentTime.getSeconds();

      return `${hour}:${minute}:${second}`;
    });
  };

  useEffect(() => {
    fetchData();

    // Time
    const intervalId = setInterval(() => {
      handleTimeChanges();
    }, 1000);

    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, []);



  const handleAttendance = async (att_status) => {
    console.log(att_status);
    try {
      const response = await axios.put(BaseUrl + "/updateAttendance", { att_status, }, config);
      if (response.data.status) {
        Toast("Attendence Marked as Present");
      }
    } catch (error) {
      Toast(`an error occured while Marking attendance: ${error}`, "error");
    }
    setAttendanceMarked(true);
    setShowConfirmationModal(false);
    await fetchData()

  };
  const handleLeave = async (att_status) => {
    console.log(att_status);
    if (leaveInfo.leave_date && leaveInfo.reason) {
      if (leaveInfo.leave_date > todayDate) {
        try {
          const response = await axios.put(BaseUrl + "/leaverequest", { ...leaveInfo }, config);
          if (response.data.success) {
            Toast(`${response.data.message}`);
          } else {
            Toast(`${response.data.message}`, "error");
          }
        } catch (error) {
          Toast(`an error occured while Marking attendance: ${error}`, "error");
        }
        setShowLeaveModal(false);
        setLeaveInfo({});
      } else {
        Toast(`Please enter Date above than ${todayDate}`);
      }
    } else {
      Toast("Please mention both date and reason. ", "info");
    }
  };

  const callAbsentFunc = () => {
    handleAttendance("Absent");
    setAttendanceMarked(true)
    return (
      <div className="alert alert-success" role="alert">
        We marked ABSENT your attendance for {todayDate} ({day}).
      </div>
    );
  };

  return (
    <div className="full-content" id="full-content">
      {/* {<h2>{currentTime}</h2>} */}
      <h2 className="mb-4" style={{ margin: 'auto' }}>Mark Attendance</h2>

      <div id="content">
        <Clock />
        {day == 'Sunday' || day == 'Saturday' ?
          (<h4 style={{margin:'auto',backgroundColor:'green',padding:'20px',color:'white'}}>Today is a holiday, Enjoy your day.</h4>) :
          <div>
        <p>Date: {todayDate}</p>
        <p>Day: {day}</p>

            {<p className="alert-primary">You can mark your attendance in between {start_time} AM to {end_time} AM</p>}
            {
              attendanceMarked ? (
                <div className="alert alert-success" role="alert">
                  You Attendance for {todayDate} ({day}) is Marked as {statOfAtt}.
                </div>
              ) : (
                <>
                  {currentTime >= start_time && currentTime <= end_time ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setShowConfirmationModal(true);
                      }}
                    >
                      Mark Attendance
                    </Button>
                  ) : currentTime > end_time && currentTime <= '23:00:00' ? (
                    callAbsentFunc()
                  ) : null}
                </>
              )
            }
          </div>}
        {/* <Button
          variant="primary"
          className="mt-3"
          onClick={() => {
            setShowLeaveModal(true);
          }}
        >
          Apply for Leave
        </Button> */}


      </div>
      {/* Confirmation Modal */}
      <Modal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Mark your Attendance for the day {todayDate} ({day})!
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmationModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleAttendance("Present")}>
            Present
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowConfirmationModal(false);
              setShowLeaveModal(true);
            }}
          >
            Apply for Leave
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showLeaveModal}
        onHide={() => setShowLeaveModal(false)}
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Leave Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          I want leave for the date
          <input
            type="date"
            name="leave_date"
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
              outline: "none",
            }}
          />
          <label>
            Mention Reason here!
            <input
              type="textarea"
              name="reason"
              onChange={handleChange}
              style={{
                width: "127%",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleLeave("leave")}>
            Sent
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
