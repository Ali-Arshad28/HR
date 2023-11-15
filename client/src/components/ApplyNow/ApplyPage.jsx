import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import ApplyNow from './ApplyNow';
import { Card, Button, InputGroup, FormControl } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import './ApplyPage.css';
import { BaseUrl } from './../../constants.js';

const inputStyle = {
  backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" role=\"img\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"css-v86lqu eac13zx0\"%3E%3Cpath fill-rule=\"evenodd\" d=\"M13.335 14.749a6.5 6.5 0 111.414-1.414l6.105 6.104a.5.5 0 010 .707l-.708.708a.5.5 0 01-.707 0l-6.104-6.105zM14 9.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z\" clip-rule=\"evenodd\"%3E%3C/path%3E%3C/svg%3E')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right calc(0.375em + 0.1875rem) center",
  backgroundSize: "calc(1em + 0.5rem) calc(1em + 0.5rem)",
  paddingRight: "2em" // Adjust this value as needed
};
// const inputStyle = {
//   backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" role=\"img\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"css-v86lqu eac13zx0\"%3E%3Cpath fill-rule=\"evenodd\" d=\"M13.335 14.749a6.5 6.5 0 111.414-1.414l6.105 6.104a.5.5 0 010 .707l-.708.708a.5.5 0 01-.707 0l-6.104-6.105zM14 9.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z\" clip-rule=\"evenodd\"%3E%3C/path%3E%3C/svg%3E')",
//   backgroundRepeat: "no-repeat",
//   backgroundPosition: "right calc(0.375em + 0.1875rem) center",
//   backgroundSize: "calc(1.5em + 0.75rem) calc(1.5em + 0.75rem)", // Increase the size here
//   paddingRight: "2em" // Adjust this value as needed
// };


export default function ApplyPage() {
  // State for filters and pagination
  const [filters, setFilters] = useState({
    location: '',
    jobTitle: '',
    experience: '',
    salary: '',
    datePosted: ''
  });
  const [allJobs, setAllJobs] = useState([]);
  const [getExperience, setExperience] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchData1();
  }, []);
  // function getUniqueObjectsByAttribute(arr, attribute) {
  //   const uniqueMap = new Map();
  //   const result = [];

  //   for (const obj of arr) {
  //     const attrValue = obj[attribute].trim();

  //     if (!uniqueMap.has(attrValue)) {
  //       uniqueMap.set(attrValue, obj);
  //       result.push(obj);
  //     }
  //   }

  //   return result;
  // }
  const fetchData = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getJobsforApply');
      setAllJobs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data jobs:', error);
    }
  };
  const fetchData1 = async () => {
    try {
      const response = await axios.get(BaseUrl + '/getExperience');
      setExperience(response.data);
    } catch (error) {
      console.error('Error fetching Experience:', error);
    }
  };

  // Toggle expand for job details
  const toggleExpand = (job_id) => {
    setExpandedJobs((prevState) => ({
      ...prevState,
      [job_id]: !prevState[job_id],
    }));
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setCurrentPage(0);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
  };

  // Filter jobs based on filters and current page
  const currentDate = new Date().toISOString().split('T')[0];
  const filteredJobs = allJobs
    .filter((job) =>
      job.location.toLowerCase().includes(filters.location.toLowerCase())
    )
    .filter((job) =>
      job.title.toLowerCase().includes(filters.jobTitle.toLowerCase())
    )
    .filter((job) =>
      job.salary.toLowerCase().includes(filters.salary.toLowerCase())
    )
    .filter((job) =>
      job.date_posted.toLowerCase().includes(filters.datePosted.toLowerCase())
    )
    .filter((job) =>
      job.experience.toLowerCase().includes(filters.experience.toLowerCase())
    )
    .filter((job) =>
      job.expiry_date >= currentDate
    );
  const offset = currentPage * itemsPerPage;
  const currentJobs = filteredJobs.slice(offset, offset + itemsPerPage);

  const [inputType, setInputType] = useState('text');

  const handleFocus = () => {
    setInputType('date');
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setInputType('text');
    }
  };
  return (
    <div className="apply-page">
      <RouterLink to="/">
        <i id="back-arrow" style={{ position: 'absolute', color: 'white', top: '35px', left: '31px', }} className="fa fa-arrow-left" aria-hidden="true" />
      </RouterLink>
      <div className="page-header">

        <h2 className='titleof' style={{ margin: '5px 0 0px 80px' , fontWeight:'bold', fontSize:'35px', textAlign:'center'}} >Jobs Available</h2>
        <hr />
        <InputGroup className="filter-inputs">
          <FormControl
            className='formcont'
            name="jobTitle"
            placeholder="Search Jobs"
            style={inputStyle}
            value={filters.jobTitle}
            onChange={handleFilterChange}

            autoComplete="off"
          />
          <FormControl
            className='formcont'
            name="salary"
            style={inputStyle}
            placeholder="Search by Salary"
            value={filters.salary}
            onChange={handleFilterChange}
            autoComplete="off"
          />
          
        <select
            name="experience"
            className='formcont'
            id="experience"
            onChange={handleFilterChange}
            value={filters.experience}
            >
            <option value="" >Search by Experience</option>
            <option value="">All</option>
            {getExperience.map((exp, index) => { return <option key={index} value={exp.experience}>{exp.experience}</option> })}

        </select>
        </InputGroup>
        
        <InputGroup style={{width:'69.2%'}} className="filter-inputs">
          <FormControl
            className='formcont'
            type={inputType}
            placeholder="Search by Posted Date"
            onFocus={handleFocus}
            onBlur={handleBlur}
            name="datePosted"
            value={filters.datePosted}
            onChange={handleFilterChange}
            autoComplete="off"
          />
          <FormControl
            className='formcont'
            name="location"
            placeholder="Search by Location"
            style={inputStyle}
            value={filters.location}
            onChange={handleFilterChange}
            autoComplete="off"
          />
        </InputGroup>
      </div>
      <span style={{ position: 'fixed', top: '22em', left: '28em', width: '400px' }}>
        <span className="page-header">
          <span style={{ width: '400px' }} class="animated-text">"At HRConnect, every job opening is an opportunity to be part of something bigger. Join us, and let's redefine success together."</span>
        </span>

      </span>
      {allJobs.length === 0 ? (
        <p className="no-jobs-message">Currently, There are no Jobs available.</p>
      ) : (
        currentJobs.map((job) => (
          
          <Card key={job.job_id} className="job-card">
            <Card.Header>
              <Card.Title style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '30px'}}>{job.title}</Card.Title>
              <hr />
              <Card.Subtitle style={{ color: 'black', fontSize:"16px" }}>Experience Required : {job.experience}</Card.Subtitle>
              <Card.Subtitle style={{ marginTop: '7px', color: 'black', fontSize:"16px"}}><i style={{color:"black", fontSize:"16px"}}class="fa fa-map-marker" aria-hidden="true"></i>  {job.location}</Card.Subtitle>
              <Card.Subtitle style={{ marginTop: '7px', fontSize:"15px", color: 'black' }}>{job.summary}</Card.Subtitle>
            </Card.Header>
            <div style={{padding:'0 10px 0 10px'}}>
              {expandedJobs[job.job_id] ? (
                <div>
                  <p style={{fontSize:'20px',fontWeight:'bold', textAlign:'center', marginTop:'14px'}}>Description</p>
                  <p style={{fontSize:'15px', marginTop:'14px'}}>{job.description}</p>
                  <hr className='hr1' />
                  <p style={{marginTop:'14px'}}>Date Posted: {job.date_posted.slice(0, 10)}</p>
                  <p style={{marginTop:'14px'}}>Salary: {job.salary}</p>
                  <p style={{marginTop:'14px'}}>Last Date to Apply: {job.expiry_date.slice(0, 10)}</p>
                  <RouterLink
                    to={{
                      pathname: '/applyPage/applyNow',
                      search: `?job_title=${job.title}&job_id=${job.job_id}&dep_id=${job.dep_id}&experience=${job.experience}`,
                      state: { job_title: job.title, dep_id: job.dep_id, experience: job.experience },
                    }}
                  >
                    <Button variant="primary" style={{marginBottom:'5px'}}>Apply Now</Button>
                  </RouterLink>
                </div>
              ) : null}
            </div>
            <Card.Footer>
              <Button style={{marginLeft:'-15px'}}variant="link" onClick={() => toggleExpand(job.job_id)}>
                {expandedJobs[job.job_id] ? 'show less' : 'show details'}
              </Button>
            </Card.Footer>
          </Card>
        ))
      )}

      <div style={{ margin: '0 17%', display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: '0', margin: '-11px 5px 5px 0' }}>

          <select
            name="itemsPerPage"
            id="itemsPerPage"
            style={{ padding: '8px', width: '105px', borderRadius: '5px', outline: 'none', border: 'none' }}
            onChange={handleItemsPerPageChange}
            value={itemsPerPage}
          >
            <optgroup label='Items/page'></optgroup>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
        <ReactPaginate
          style={{ flex: '2', marginLeft: '0px' }}
          previousLabel={'Previous'}
          nextLabel={'Next'}
          pageCount={Math.ceil(filteredJobs.length / itemsPerPage)}
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
    </div>
  );
}


const DatePickerInput = ` display: none;
  position: absolute;
  left: 100%;
  top: 10%;
  margin-left: 12px;
  width: 0%;
  &::-webkit-calendar-picker-indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    cursor: pointer;
  }
`;