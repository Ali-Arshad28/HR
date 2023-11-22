export const BaseUrl = 'http://localhost:3002';
export const employeeId = 121;
export const start_time = "10:0:0"
export const end_time = "11:30:0"
// const jwtToken = Cookies.get('jwtToken');//jwtToken:user_id, role_id,emp_id
// export const config = {
//     headers: {
//       authorization: `Bearer ${jwtToken}`,
//     },
//     withCredentials: true
//   };
const jwtToken = localStorage.getItem('jwtToken');
// console.log('JWT Token:', jwtToken); // Log the token
export const config = {
  headers: { authorization: `Bearer ${jwtToken}` },
  withCredentials: true,
};
// const jwtToken = Cookies.get('jwtToken');//jwtToken:user_id, role_id,emp_id
// if (jwtToken) {
//   console.log('token sent');
//   axios.defaults.headers.common['authorization'] = `Bearer ${jwtToken}`;
// }
export const inputStyle = {
  backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" role=\"img\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"css-v86lqu eac13zx0\"%3E%3Cpath fill-rule=\"evenodd\" d=\"M13.335 14.749a6.5 6.5 0 111.414-1.414l6.105 6.104a.5.5 0 010 .707l-.708.708a.5.5 0 01-.707 0l-6.104-6.105zM14 9.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z\" clip-rule=\"evenodd\"%3E%3C/path%3E%3C/svg%3E')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right calc(0.375em + 0.1875rem) center",
  backgroundSize: "calc(1em + 0.5rem) calc(1em + 0.5rem)",
  paddingRight: "2em" // Adjust this value as needed
};