import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Clock, Users, Activity } from "lucide-react";

export default function DoctorDashboard() {
  // Mock data
  const stats = [
    { title: "Verified Patients", value: "1,245", icon: Users, trend: "+12%" },
    { title: "Appointments This Week", value: "24", icon: Activity, trend: "+5%" },
    { title: "Approval Rate", value: "94%", icon: CheckCircle2, trend: "+2%" },
    { title: "Avg. Response Time", value: "2.4h", icon: Clock, trend: "-10%" },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patientName: "Jane Smith",
      time: "Today, 2:30 PM",
      type: "Follow-up",
      status: "Confirmed",
    },
    {
      id: 2,
      patientName: "Robert Johnson",
      time: "Tomorrow, 10:00 AM",
      type: "New Consultation",
      status: "Pending",
    },
    {
      id: 3,
      patientName: "Maria Garcia",
      time: "Oct 16, 3:15 PM",
      type: "Skin Check",
      status: "Confirmed",
    },
  ];

  return (
    <section className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Doctor Dashboard</h1>
        <p className="text-white/60 mt-1">
          Overview of your practice and patient interactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-background">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-medium text-white/60">{stat.title}</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm flex items-center space-x-2 text-white/60">
                <span className={stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"}>
                  {stat.trend}
                </span>
                vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          Upcoming Appointments
        </h2>
        <div className="space-y-4">
          {upcomingAppointments.map((appt) => (
            <Card key={appt.id} className="bg-background">
              <CardContent className="space-y-3">
                <div className="flex items-between justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white">{appt.patientName}</p>
                    <p className="text-sm text-white/60">{appt.time}</p>
                    <span className="px-2 py-0.5 rounded text-xs font-medium">
                      {appt.status === "Confirmed" ? (
                        <span className="bg-green-900/20 text-green-300">
                          Confirmed
                        </span>
                      ) : (
                        <span className="bg-yellow-900/20 text-yellow-300">
                          Pending
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{appt.type}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Empty state */}
        {upcomingAppointments.length === 0 && (
          <p className="text-center py-8 text-white/60">
            No upcoming appointments. Your schedule is clear.
          </p>
        )}
      </div>
    </section>
  );
}
