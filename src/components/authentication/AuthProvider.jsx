import axios from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery} from '@tanstack/react-query'


const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [authData, setAuthData] = useState(() => {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && !authData) {
      setAuthData(JSON.parse(storedUser))
    }
  }, [])  
  
     useEffect(() => {
      axios.defaults.withCredentials = true

        const requestInterceptor = axios.interceptors.request.use(
          (config) => {
            config.withCredentials = true
          return config
        },
          (error) =>  {
            Promise.reject(error)
          }
        )

       const responseInterseptor = axios.interceptors.response.use(
           response => {
           return response
         },
               async (error) => {
               console.log(error)
               if (error.response.status === 412) {
                  await refreshToken()
                  return axios(error.config)
               }
               if (error.response.status === 401) {
                 await refreshToken()
                 return axios(error.config)
              }
                  if (error.response.status === 403) {
                    //logout()

               }
               return error
        })
        return () => {
          axios.interceptors.request.eject(requestInterceptor)
          axios.interceptors.response.eject(responseInterseptor)
        }
        
      }, [])


  const loginMutation  = useMutation({
    mutationFn: async (credentials) => {
      
      const response = await axios.post(`/api/login`, credentials,{
        headers: {'Content-Type': 'application/json'},
        withCredentials: true, })
        console.log('response:', response)
      return response
      
    },

    onSuccess: (data) => {
        const user = { username: JSON.parse(data.config.data).username, userId: data.data.id, phone: data.data.phone, role: data.data.role, name: data.data.userName } //token ,
        setAuthData(user)
        localStorage.setItem('user', JSON.stringify(user))
        queryClient.setQueryData(['user', user.userId], user)
        navigate('/dashboard')
    },
    onError: (error) => {
      console.error({error})
      console.error({error: JSON.stringify(error)})
      alert('Email ou mot de passe incorrect.')
    },
  })

  const updateUser = (updatedData) => {
    setAuthData((prevData) => {
      const newAuthData = { ...prevData, ...updatedData }
      localStorage.setItem('user', JSON.stringify(newAuthData))
      return newAuthData
    })
  }

    const logoutMutation  = useMutation({
      mutationFn: async () => {
        return await axios.post(`/api/logout`,{},
          { withCredentials: true, }
        )
      },

      onSuccess: () => {
      setAuthData(null)
      localStorage.removeItem('user')
      navigate('/login')
      },

      onError: (error) => {
        console.error('Logout failed:', error)
        alert('Logout failed. Please try again.')
      },

      onSettled: () => {
        queryClient.invalidateQueries(['user'])
      },
    })

  const refreshToken = async () => {
    try {
      console.log('refreshToken')
        const response = await axios.post(`/api/refresh-token`,{},
        {withCredentials: true}) 
      console.log('Refresh token response:', response.data)
      return response.data
    }catch (error) {
      console.error("Error refreshing access token:", error)
      logout()
      throw error
    }
  }

  const login = (credentials) => {
    loginMutation.mutate(credentials)
  }

  const logout = () => {
    logoutMutation.mutate()
    queryClient.cancelQueries()
    setAuthData(null)
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{user: authData, login, logout, loginLoading: loginMutation.isLoading, logoutLoading: logoutMutation.isLoading, refreshToken, updateUser}}>
            {children}
    </AuthContext.Provider> 
  )
}

  export const useAuth = () =>{
    return useContext(AuthContext)
  }

export default AuthProvider