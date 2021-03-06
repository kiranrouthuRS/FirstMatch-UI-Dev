import axios from 'axios'
import { fetchUsersFailure } from '../redux/login/loginAction'
import { fetchUsersRequest } from '../redux/login/loginAction'
import { fetchUsersSuccess } from '../redux/login/loginAction'
import { fetchQuestionsFailure } from '../redux/FetchQuestions/QuestionsAction'
import { fetchQuestionsRequest } from '../redux/FetchQuestions/QuestionsAction'
import { fetchQuestionsSuccess } from '../redux/FetchQuestions/QuestionsAction'
import { addQuestionsFailure } from '../redux/AddQuestions/AddQuestionsAction'
import { addQuestionsRequest } from '../redux/AddQuestions/AddQuestionsAction'
import { addQuestionsSuccess } from '../redux/AddQuestions/AddQuestionsAction'
import { eifQuestionsFailure } from '../redux/EifQuestions/EifQuestionsAction'
import { eifQuestionsRequest } from '../redux/EifQuestions/EifQuestionsAction'
import { eifQuestionsSuccess } from '../redux/EifQuestions/EifQuestionsAction'
import { rafQuestionsFailure } from '../redux/RafQuestions/RafQuestionsAction'
import { rafQuestionsRequest } from '../redux/RafQuestions/RafQuestionsAction'
import { rafQuestionsSuccess } from '../redux/RafQuestions/RafQuestionsAction'
import { addQuestionsCategoryFailure, addQuestionsCategoryRequest, addQuestionsCategorySuccess }
  from '../redux/AddQuestionsCategory/AddQuestionsCategoryAction';
import {
  fetchQuestionscategoryFailure,
  fetchQuestionscategoryRequest,
  fetchQuestionscategorySuccess
}
  from '../redux/FetchQuestionsCategory/QuestionsCategoryAction'
import { addEifFailure, addEifRequest, addEifSuccess }
  from '../redux/AddEIF/AddEIFAction'
import { addRafFailure, addRafRequest, addRafSuccess }
  from '../redux/AddRAF/AddRAFAction'
import { fetchEifListFailure, fetchEifListRequest, fetchEifListSuccess }
  from '../redux/FetchEIFList/EIFListAction'
import { fetchRafListFailure, fetchRafListRequest, fetchRafListSuccess }
  from '../redux/FetchRAFList/RAFListAction'
import { checkDomainFailure, checkDomainSuccess, checkDomainRequest }
  from '../redux/CheckDomain/CheckDomainAction'
import { addUsersFailure, addUsersRequest, addUsersSuccess }
  from '../redux/AddUsers/AddUsersAction'
import { getUsersFailure, getUsersRequest, getUsersSuccess }
  from '../redux/GetUsers/GetUsersAction'
  import { getOrganizationsFailure,getOrganizationsRequest, getOrganizationsSuccess }
  from '../redux/GetOrganizations/GetOrganizationsAction'
  import { addOrganizationsFailure, addOrganizationsRequest, addOrganizationsSuccess }
  from '../redux/AddOrganization/AddOrganizationsAction'
import createAuthRefreshInterceptor from "axios-auth-refresh"
import { update } from '../redux/login/loginAction'
import { clearUser } from '../redux/login/loginAction'
import { store } from '../App'
export const baseApiUrl = "http://3.7.135.210:8005";
//export const baseApiUrl = "https://819f0acc214a.ngrok.io";

const refreshAuthLogic = async failedRequest => {
  //  const { store } = store
  const userState = store.getState().user;
  const currentUser = userState.user;
  if (!userState) {
    return Promise.reject();
  }
  const tokenRefreshResponse = await axios.post(`${baseApiUrl}/admin/refresh/`, {
    refresh: currentUser.refreshToken
  })
  localStorage.setItem('refreshtoken', tokenRefreshResponse.data.token)
  const accessToken = tokenRefreshResponse.data.access_token

  store.dispatch(update({
    user: {
      ...currentUser,
      accessToken
    }
  }))
  failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.token
  return Promise.resolve()

}

createAuthRefreshInterceptor(axios, refreshAuthLogic);

export const login = async (email, password) => {

  const { dispatch } = store
  try {
    dispatch(fetchUsersRequest)
    const response = await axios.post(`${baseApiUrl}/admin/login`, { username: email, password: password });
    const { token, user_id, role_type,is_pwd_updated } = response.data.response
    const user = {
      email,
      token,
      user_id,
      role_type: role_type,
      is_pwd_updated: is_pwd_updated
    }
    dispatch(fetchUsersSuccess(user))
    localStorage.setItem("refreshToken", response.data.token);
    return response;
  } catch (error) {
    dispatch(fetchUsersFailure(error.message))
    throwError(error)
  }
}; 

export const forgotPassWord = async (email_id) => {
  const { dispatch } = store
  
  try {
    return await axios.get(`${baseApiUrl}/admin/forgot-password?email_id=${email_id}`)
      .then(response => {
        const checkdomain = response.data
       return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(checkDomainFailure(error.message))
    throwError(error)

  }
};

export const checkDomain = async (domain) => {
  const { dispatch } = store
  const data = `${domain}`
  
  try {
    dispatch(checkDomainRequest)
    return await axios.post(`${baseApiUrl}/check/domain`, { domain: data })
      .then(response => {
        const checkdomain = response.data
        dispatch(checkDomainSuccess(checkdomain))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(checkDomainFailure(error.message))
    throwError(error)

  }
};

export const fetchQuestions = async (value) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  try {
    dispatch(fetchQuestionsRequest)
    return await axios.get(`${baseApiUrl}/questions/?category=${value}`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
    .then(response => {
        const questionsList = response.data

        dispatch(fetchQuestionsSuccess(questionsList))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(fetchQuestionsFailure(error.message))
    throwError(error)

  }
};

export const fetchEmails = async () => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  
  try {
       return await axios.get(`${baseApiUrl}/admin/email-statuses`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const emailsList = response.data
        return response.data;
      })

  }

  catch (error) {
    console.log('error')
    
    throwError(error)

  }
};

export const alterQuestions = async (srcI,desI) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  const data = {
    parent_question: srcI, 
    child_question_id: desI
  }
  return await axios.post(`${baseApiUrl}/questionsrelation/`,data , {
    headers: {
      'Authorization': `Bearer ${currentUser}`
    }
  })
  
};

export const fetchUsers = async () => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  
  try {
    dispatch(getUsersRequest)
    return await axios.get(`${baseApiUrl}/users/`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const usersList = response.data
        
        dispatch(getUsersSuccess(usersList))
        return response.data;
      })

  }

  catch (error) {
    console.log('error')
    dispatch(getUsersFailure(error.message))
    throwError(error)

  }
};

export const fetchOrganizations = async () => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  
  try {
    dispatch(getOrganizationsRequest)
    return await axios.get(`${baseApiUrl}/customers/`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const organizationsList = response.data
        
        dispatch(getOrganizationsSuccess(organizationsList))
        return response.data;
      })

  }

  catch (error) {
    console.log('error')
    dispatch(getOrganizationsFailure(error.message))
    throwError(error)

  }
};

export const fetchEiflist = async () => {

  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  
  try {
    dispatch(fetchEifListRequest)
    return await axios.get(`${baseApiUrl}/staging?category=1`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const EifList = response.data
        dispatch(fetchEifListSuccess(EifList))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(fetchEifListFailure(error.message))
    throwError(error)

  }
};

export const fetchRaflist = async () => {

  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  try {
    dispatch(fetchRafListRequest)
    return await axios.get(`${baseApiUrl}/staging?category=2`, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const RafList = response.data
        dispatch(fetchRafListSuccess(RafList))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(fetchRafListFailure(error.message))
    throwError(error)

  }
};

export const fetchQuestionsCategory = async () => {
  const { dispatch } = store
  try {
    dispatch(fetchQuestionscategoryRequest)
    return await axios.get(`${baseApiUrl}/questionscategory/`)
      .then(response => {
        const questionscategoryList = response.data
        dispatch(fetchQuestionscategorySuccess(questionscategoryList))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(fetchQuestionscategoryFailure(error.message))
    throwError(error)

  }
};

export const AddQuestions = async (data,id) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  if (id) {
    try {
      dispatch(addQuestionsRequest)
      return await axios.put(`${baseApiUrl}/questions/${id}/`, data, {
        headers: {
          'Authorization': `Bearer ${currentUser}`
        }
      })
        .then(response => {
          const addedquestions = response.data
          dispatch(addQuestionsSuccess(addedquestions))
          return response.data;
        })
    }
  
    catch (error) {
      console.log('error')
      dispatch(addQuestionsFailure(error.message))
      throwError(error)
  
    }
  }else{
    try {
      dispatch(addQuestionsRequest)
      return await axios.post(`${baseApiUrl}/questions/`, data, {
        headers: {
          'Authorization': `Bearer ${currentUser}`
        }
      })
        .then(response => {
          const addedquestions = response.data
          dispatch(addQuestionsSuccess(addedquestions))
          return response.data;
        })
    }
  
    catch (error) {
      console.log('error')
      dispatch(addQuestionsFailure(error.message))
      throwError(error)
  
    }
  }
  
};

export const AddUsers = async (data, id) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  if (id) {
    try {
      dispatch(addUsersRequest)
      return await axios.put(`${baseApiUrl}/users/${id}/`, data, {
        headers: {
          'Authorization': `Bearer ${currentUser}`
        }
      })
        .then(response => {
          const addedusers = response.data
          dispatch(addUsersSuccess(addedusers))
          
          return response.data;
        })
    }
  
    catch (error) {
      console.log('error')
      dispatch(addUsersFailure(error.message))
      throwError(error)
  
    }
  } else {
    try {
      dispatch(addUsersRequest)
      return await axios.post(`${baseApiUrl}/users/`, data, {
        headers: {
          'Authorization': `Bearer ${currentUser}`
        }
      })
        .then(response => {
          const addedusers = response.data
          dispatch(addUsersSuccess(addedusers))
          
          return response.data;
        })
    }
  
    catch (error) {
      console.log('error')
      dispatch(addUsersFailure(error.message))
      throwError(error)
  
    }
  }
  
};

export const AddOrganizations = async (data,id) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  if(id){
    try{
      
      dispatch(addOrganizationsRequest) 
         const d ={
           name: data.name,
           country: data.country,
           org_name: data.org_name,
           mobile: data.mobile,
           email_id: data.email_id,
           gender: "2"
         }
         
         return await axios.put(`${baseApiUrl}/customers/${id}/`, d, {
           headers: {
             'Authorization': `Bearer ${currentUser}`
           }
         })
           .then(response => {
             const addedOrganizations = response.data
             dispatch(addOrganizationsSuccess(addedOrganizations))
             
             return response.data;
           })
       }
     
       catch (error) {
         console.log(error,'error')
         dispatch(addOrganizationsFailure(error.message))
         throwError(error)
       }
  }else{
    try{
      dispatch(addOrganizationsRequest)
         const d ={
           name: data.name,
           country: data.country,
           org_name: data.org_name,
           mobile: data.mobile,
           email_id: data.email_id,
           gender: "2"
         }
         return await axios.post(`${baseApiUrl}/customers/`, d, {
           headers: {
             'Authorization': `Bearer ${currentUser}`
           }
         })
           .then(response => {
             const addedOrganizations = response.data
             dispatch(addOrganizationsSuccess(addedOrganizations))
             
             return response.data;
           })
       }
     
       catch (error) {
         console.log(error,'error')
         dispatch(addOrganizationsFailure(error.message))
         throwError(error)
       }
  }
  
   
 };


export const submitEIF = async (data) => {

  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;

  try {
    dispatch(addEifRequest)
    return await axios.post(`${baseApiUrl}/staging`, {
      category: 1,
      answers: data,
      is_completely_filled: "true"
    }, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const addeif = response.data
        dispatch(addEifSuccess(addeif))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(addEifFailure(error.message))
    throwError(error)

  }
};

export const submitRAF = async (data, customer, is_completely_filled) => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  try {
    dispatch(addRafRequest)
    return await axios.post(`${baseApiUrl}/staging`, {
      category: 2, customer: customer,
      answers: data, is_completely_filled: is_completely_filled
    }, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const addraf = response.data
        dispatch(addRafSuccess(addraf))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(addRafFailure(error.message))
    throwError(error)

  }
};

export const eifQuestions = async () => {

  const { dispatch } = store
  try {
    dispatch(eifQuestionsRequest)
    await axios.get(`${baseApiUrl}/stages?category=1`)
      .then(response => {
        const loadquestions = response.data
        dispatch(eifQuestionsSuccess(loadquestions))
        return response.data;
      })
  }
  catch (error) {
    console.log('error')
    dispatch(eifQuestionsFailure(error.message))
    throwError(error)

  }
};

export const rafQuestions = async (customer) => {

  const { dispatch } = store
  try {
    dispatch(rafQuestionsRequest)
    return await axios.get(`${baseApiUrl}/stages?category=2&customer=${customer}`)
      .then(response => {
        const loadrafquestions = response.data
        dispatch(rafQuestionsSuccess(loadrafquestions))
        return response.data;
      })
  }
  catch (error) {
    console.log('error')
    dispatch(rafQuestionsFailure(error.message))
    throwError(error)

  }
};

export const AddQuestionsCategory = async (data) => {

  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;

  try {
    dispatch(addQuestionsCategoryRequest)
    return await axios.post(`${baseApiUrl}/questionscategory/`, data, {
      headers: {
        'Authorization': `Bearer ${currentUser}`
      }
    })
      .then(response => {
        const addquestionscategory = response.data
        dispatch(addQuestionsCategorySuccess(addquestionscategory))
        return response.data;
      })
  }

  catch (error) {
    console.log('error')
    dispatch(addQuestionsCategoryFailure(error.message))
    throwError(error)

  }
};

export const logOut = () => {
  const { dispatch } = store
  const currentUser = store.getState().loginData.user.token;
  axios.post(`${baseApiUrl}/admin/logout`, {
    headers: {
      'Authorization': `Bearer ${currentUser}`
    }
  })
    .then(response => {
      dispatch(clearUser())
      return response.data;
    })

};

export const register = async (data) => {
  const { dispatch } = store
  
  try {
    await axios.post("http://52.64.1.72/signup/",
      {
        siteid: data.siteid,
        pass_word: data.pass_word,
        firstname: data.firstname,
        last_name: data.last_name,
        mobile: data.mobile,
        email: data.email
      });
  } catch (error) {
    console.log('error')
    dispatch(fetchUsersFailure(error.message))
    throwError(error)
  }
};



function throwError(error) {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    const errorResponse = {
      data: error.response.data || undefined,
      status: error.response.status || undefined
    };
    throw errorResponse;
  } else if (error.request) {
    console.log(error.request);
    const errorResponse = {
      data: { Error: "unknown error occurred while contacting the server" },
      status: undefined
    };
    throw errorResponse;
  } else {
    console.log("Error", error.message);
  }
}

export default createAuthRefreshInterceptor