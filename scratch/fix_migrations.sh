#!/bin/bash
set -e

# Base directory for migrations
MIG_DIR="/Users/artsiomhrableuski/Projects/space_memory-recrut/database/migrations"
PHP_BIN="/Users/artsiomhrableuski/Library/Application Support/Herd/bin/php"

echo "Renaming migrations to fix dependency order..."

# Create a function to safely move
safe_mv() {
    if [ -f "$MIG_DIR/$1" ]; then
        mv "$MIG_DIR/$1" "$MIG_DIR/$2"
        echo "Moved $1 to $2"
    else
        echo "Skip $1 (not found)"
    fi
}

safe_mv "2026_04_01_000010_create_gls_projects_table.php" "2026_03_10_000010_create_gls_projects_table.php"
safe_mv "2026_04_01_000015_create_gls_invoice_counters_table.php" "2026_03_10_000015_create_gls_invoice_counters_table.php"
safe_mv "2026_04_01_000020_create_gls_payment_charges_table.php" "2026_03_10_000020_create_gls_payment_charges_table.php"
safe_mv "2026_04_01_000030_create_gls_payment_transactions_table.php" "2026_03_10_000030_create_gls_payment_transactions_table.php"
safe_mv "2026_04_01_000031_add_liqpay_to_provider_enum_in_gls_payment_transactions.php" "2026_03_10_000031_add_liqpay_to_provider_enum_in_gls_payment_transactions.php"
safe_mv "2026_04_01_000040_create_gls_payment_allocations_table.php" "2026_03_10_000040_create_gls_payment_allocations_table.php"
safe_mv "2026_04_01_000050_create_gls_lesson_additional_table.php" "2026_03_10_000050_create_gls_lesson_additional_table.php"
safe_mv "2026_04_01_000060_create_gls_invoice_documents_table.php" "2026_03_10_000060_create_gls_invoice_documents_table.php"
safe_mv "2026_04_01_000065_add_pdf_and_sale_date_to_gls_invoice_documents.php" "2026_03_10_000065_add_pdf_and_sale_date_to_gls_invoice_documents.php"
safe_mv "2026_04_01_000070_create_gls_salary_calculations_table.php" "2026_03_10_000070_create_gls_salary_calculations_table.php"
safe_mv "2026_04_01_000080_create_gls_salary_disputes_table.php" "2026_03_10_000080_create_gls_salary_disputes_table.php"
safe_mv "2026_04_01_000090_create_gls_documents_table.php" "2026_03_10_000090_create_gls_documents_table.php"
safe_mv "2026_04_01_000095_add_title_to_gls_documents_table.php" "2026_03_10_000095_add_title_to_gls_documents_table.php"
safe_mv "2026_04_01_000096_add_doc_type_to_gls_documents_table.php" "2026_03_10_000096_add_doc_type_to_gls_documents_table.php"
safe_mv "2026_04_01_000097_add_doc_template_to_gls_documents_table.php" "2026_03_10_000097_add_doc_template_to_gls_documents_table.php"
safe_mv "2026_04_02_000070_create_gls_payment_plans_table.php" "2026_03_10_000070_create_gls_payment_plans_table.php"
safe_mv "2026_04_02_000080_add_plan_fields_to_gls_payment_transactions_table.php" "2026_03_10_000080_add_plan_fields_to_gls_payment_transactions_table.php"
safe_mv "2026_04_11_000001_create_gls_activity_logs_table.php" "2026_03_10_000001_create_gls_activity_logs_table.php"

echo "Running migrate:fresh..."
"$PHP_BIN" /Users/artsiomhrableuski/Projects/space_memory-recrut/artisan migrate:fresh --force

echo "Setup Complete"
