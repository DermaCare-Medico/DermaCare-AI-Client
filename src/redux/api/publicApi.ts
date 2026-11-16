export {
  useGetDoctorsQuery as useGetPublicDoctorsQuery,
  useGetDoctorByIdQuery as useGetPublicDoctorQuery,
  useGetDoctorSlotsQuery as useGetPublicDoctorSlotsQuery,
} from "./doctorApi";

export type { DoctorQuery as DoctorSearchArgs } from "./doctorApi";
