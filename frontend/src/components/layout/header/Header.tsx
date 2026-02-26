// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// // import { useAuthContext } from "@/lib/auth/auth-context";
// import { ModeToggle } from "@/themes/ModeToggle";

// import { LogOut, Settings, UserCircle } from "lucide-react";
// import Link from "next/link";

// export function Header() {
// //   const { user, logout } = useAuthContext();

// //   const initials = user?.name
// //     ? user.name
// //         .split(" ")
// //         .map((n) => n[0])
// //         .join("")
// //         .toUpperCase()
// //         .substring(0, 2)
// //     : "U";

//   return (
//     <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
//       <SidebarTrigger className="-ml-1" />
//       <Separator orientation="vertical" className="mr-2 h-4" />
//       <div className="ml-auto flex items-center gap-3">
//         <ModeToggle />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="relative h-9 w-9 rounded-full">
//               <Avatar className="h-9 w-9">
//                 <AvatarImage src="/avatars/user.jpg" alt={user?.name} />
//                 <AvatarFallback>{initials}</AvatarFallback>
//               </Avatar>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="w-56" align="end" forceMount>
//             <DropdownMenuLabel className="font-normal">
//               <div className="flex flex-col space-y-1">
//                 <p className="text-sm font-medium leading-none">{user?.name}</p>
//                 <p className="text-xs leading-none text-muted-foreground">
//                   {user?.email}
//                 </p>
//               </div>
//             </DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem asChild>
//               <Link href="/profile" className="cursor-pointer">
//                 <UserCircle className="mr-2 h-4 w-4" />
//                 <span>Profile</span>
//               </Link>
//             </DropdownMenuItem>
//             <DropdownMenuItem asChild>
//               <Link href="/settings" className="cursor-pointer">
//                 <Settings className="mr-2 h-4 w-4" />
//                 <span>Settings</span>
//               </Link>
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem
//               onClick={logout}
//               className="cursor-pointer text-red-600 focus:text-red-600"
//             >
//               <LogOut className="mr-2 h-4 w-4" />
//               <span>Log out</span>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// }