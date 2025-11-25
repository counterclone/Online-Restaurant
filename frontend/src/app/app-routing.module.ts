import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RestaurantListComponent } from './components/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './components/restaurant-detail/restaurant-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderCheckoutComponent } from './components/order-checkout/order-checkout.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderTrackComponent } from './components/order-track/order-track.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManageRestaurantsComponent } from './components/manage-restaurants/manage-restaurants.component';
import { DeliveryDashboardComponent } from './components/delivery-dashboard/delivery-dashboard.component';
import { DeliveryOrdersComponent } from './components/delivery-orders/delivery-orders.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AddressComponent } from './components/address/address.component';
import { ManageMenuItemsComponent } from './components/manage-menu-items/manage-menu-items.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Customer routes
  { path: 'restaurants', component: RestaurantListComponent, canActivate: [authGuard] },
  { path: 'restaurants/:id', component: RestaurantDetailComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: OrderCheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderTrackComponent, canActivate: [authGuard] },
  { path: 'orders/:id/track', component: OrderTrackComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/address', component: AddressComponent, canActivate: [authGuard] },
  
  // Admin routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/restaurants', component: ManageRestaurantsComponent, canActivate: [authGuard] },
  { path: 'admin/restaurants/:id/menu', component: ManageMenuItemsComponent, canActivate: [authGuard] },
  { path: 'admin/delivery-orders', component: DeliveryOrdersComponent, canActivate: [authGuard] },
  
  // Delivery agent routes
  { path: 'delivery/dashboard', component: DeliveryDashboardComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/login' }
];
