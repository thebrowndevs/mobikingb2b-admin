// components/FormInputField.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export default function FormInputField({
    control,
    name,
    label,
    placeholder,
    type = 'text',
    className = '',
    disabled = false
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input {...field} type={type} disabled={disabled} placeholder={placeholder} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
