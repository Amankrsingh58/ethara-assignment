import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/projects',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Projects', 'Project'],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/',
      providesTags: ['Projects'],
    }),
    getProject: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Projects', { type: 'Project', id }],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    addMember: builder.mutation({
      query: ({ projectId, email, role }) => ({
        url: `/${projectId}/members`,
        method: 'POST',
        body: { email, role },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        'Projects',
        { type: 'Project', id: projectId },
      ],
    }),
    removeMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        'Projects',
        { type: 'Project', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = projectApi;
