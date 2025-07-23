import { useAuth } from '@/contexts/auth-context'

// Hook to check user permissions
export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (module: string, action: 'view' | 'manage') => {
    if (!user) return false
    
    // Admins have all permissions
    if (user.role === 'admin') return true
    
    // Check specific permissions
    if (user.permissions && typeof user.permissions === 'object') {
      const modulePermissions = user.permissions[module]
      if (modulePermissions && typeof modulePermissions === 'object') {
        return modulePermissions[action] === true
      }
    }
    
    return false
  }

  const canView = (module: string) => hasPermission(module, 'view')
  const canManage = (module: string) => hasPermission(module, 'manage')

  return {
    hasPermission,
    canView,
    canManage,
    isAdmin: user?.role === 'admin',
    permissions: user?.permissions || {}
  }
}

// Available modules for permission checking
export const MODULES = {
  SUPPLIERS: 'suppliers',
  MASTER_DATA: 'masterData',
  RAW_MATERIALS: 'rawMaterials',
  FINISHED_GOODS: 'finishedGoods',
  CUSTOMERS: 'customers',
  STOCK_LOGS: 'stockLogs',
  WASTAGE_SALES: 'wastageSales'
} as const

// Component to conditionally render based on permissions
interface PermissionGateProps {
  module: string
  action: 'view' | 'manage'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ module, action, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions()
  
  if (hasPermission(module, action)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}
