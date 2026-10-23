#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d0dc5a791e103a6c33be2b0abbb0db84f47c8aa8845baa046cf206c5e47aac8a/contract';
import endContract from '../../snapshots/d0dc5a791e103a6c33be2b0abbb0db84f47c8aa8845baa046cf206c5e47aac8a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'AppealStatus',
        members: ['PENDING', 'APPROVED', 'REJECTED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'AuditAction',
        members: [
          'PASSWORD_RESET',
          'KYC_LOCK',
          'KYC_UNLOCK',
          'KYC_CHANGE',
          'USER_SUSPEND',
          'USER_ACTIVATE',
          'DEPOSIT_APPROVE',
          'DEPOSIT_REJECT',
          'WITHDRAWAL_APPROVE',
          'WITHDRAWAL_REJECT',
          'ADMIN_ADJUSTMENT',
          'PLAN_CREATE',
          'PLAN_UPDATE',
          'PLAN_DELETE',
          'PLAN_PUBLISH',
          'PLAN_UNPUBLISH',
          'SETTINGS_UPDATE',
        ],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'DepositStatus',
        members: ['PENDING', 'APPROVED', 'REJECTED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'InvestmentStatus',
        members: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'PlanStatus',
        members: ['DRAFT', 'PUBLISHED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'ReferralLevel',
        members: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'RewardPeriod',
        members: ['DAYS_7', 'MONTHLY'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'TransactionStatus',
        members: ['PENDING', 'COMPLETED', 'REVERSED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'TransactionType',
        members: [
          'DEPOSIT',
          'INVESTMENT',
          'DAILY_EARNING',
          'REFERRAL_COMMISSION',
          'ACTIVE_USER_REWARD',
          'WITHDRAWAL',
          'WITHDRAWAL_FEE',
          'ADMIN_ADJUSTMENT',
        ],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'UserRole',
        members: ['USER', 'ADMIN'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'UserStatus',
        members: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'WithdrawalStatus',
        members: ['PENDING', 'APPROVED', 'REJECTED'],
      }),
      this.createTable({
        schema: 'public',
        table: 'AccountAppeal',
        columns: [
          col('adminNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('reviewedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"AppealStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'AppealStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ActiveUserReward',
        columns: [
          col('activeUserCount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('claimedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('period', '"RewardPeriod"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'RewardPeriod' } },
          }),
          col('periodEnd', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('periodStart', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('rewardAmount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'AuditLog',
        columns: [
          col('action', '"AuditAction"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'AuditAction' } },
          }),
          col('adminId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
          col('targetUserId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Deposit',
        columns: [
          col('amountPKR', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('approvedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('creditAmountUSD', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('exchangeRate', 'numeric(18,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 4 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentMethod', 'text', {
            notNull: true,
            default: lit('Easypaisa'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('rejectedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('rejectionReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"DepositStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'DepositStatus' } },
          }),
          col('submittedAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('transactionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'EarningCollection',
        columns: [
          col('amount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('collectedAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('investmentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('transactionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Investment',
        columns: [
          col('amount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('dailyReturn', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('durationDays', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('endsAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastCollectedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('level1Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('level2Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('level3Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('nextCollectionAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('planId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startedAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('status', '"InvestmentStatus"', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'InvestmentStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'InvestmentPlan',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('dailyEarning', 'numeric(18,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 4 } },
          }),
          col('depositAmount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('durationDays', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isSpecial', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('level1Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('level2Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('level3Percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('maxPurchasesPerUser', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profitAmount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('referralBonusUSD', 'numeric(18,2)', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('status', '"PlanStatus"', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'PlanStatus' } },
          }),
          col('totalReturn', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PlatformSettings',
        columns: [
          col('adminTwoFactor', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('depositAccountName', 'text', {
            notNull: true,
            default: lit('ClaudeInvest'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('depositAccountNumber', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('depositApprovalMaxHours', 'int4', {
            notNull: true,
            default: lit(3),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('depositApprovalMinHours', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('depositCurrency', 'text', {
            notNull: true,
            default: lit('PKR'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('depositInstructions', 'text', {
            notNull: true,
            default: lit('Send payment to the account above and enter your transaction ID.'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('depositPaymentMethod', 'text', {
            notNull: true,
            default: lit('Easypaisa'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('exchangeRate', 'numeric(18,4)', {
            notNull: true,
            default: lit('300'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 4 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('maintenanceMode', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('platformCurrency', 'text', {
            notNull: true,
            default: lit('USD'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('platformName', 'text', {
            notNull: true,
            default: lit('ClaudeInvest'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('supportEmail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('withdrawalApprovalMaxHours', 'int4', {
            notNull: true,
            default: lit(2),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('withdrawalClosingHour', 'int4', {
            notNull: true,
            default: lit(23),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('withdrawalCurrency', 'text', {
            notNull: true,
            default: lit('PKR'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('withdrawalFeePercent', 'numeric(10,4)', {
            notNull: true,
            default: lit('12'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('withdrawalFriday', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalMonday', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalOpeningHour', 'int4', {
            notNull: true,
            default: lit(9),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('withdrawalSaturday', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalSunday', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalThursday', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalTuesday', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('withdrawalWednesday', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ReferralCommission',
        columns: [
          col('beneficiaryId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('commissionAmount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('investmentAmount', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('investmentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('level', '"ReferralLevel"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'ReferralLevel' } },
          }),
          col('percent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('sourceUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Transaction',
        columns: [
          col('amountUSD', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('balanceAfter', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('balanceBefore', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('depositId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referenceId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"TransactionStatus"', {
            notNull: true,
            default: lit('COMPLETED'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'TransactionStatus' } },
          }),
          col('type', '"TransactionType"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'TransactionType' } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('withdrawalId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('premiumBadge', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('publicUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referralCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referredById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"UserRole"', {
            notNull: true,
            default: lit('USER'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'UserRole' } },
          }),
          col('status', '"UserStatus"', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'UserStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Withdrawal',
        columns: [
          col('accountName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('amountUSD', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('approvedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('cnicNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('easypaisaNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('exchangeRate', 'numeric(18,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 4 } },
          }),
          col('feePercent', 'numeric(10,4)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 4 } },
          }),
          col('feeUSD', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('netAmountUSD', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('payoutPKR', 'numeric(18,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 18, scale: 2 } },
          }),
          col('rejectedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('rejectionReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('requestedAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('reviewedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"WithdrawalStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'WithdrawalStatus' } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'WithdrawalProfile',
        columns: [
          col('accountName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cnicNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('easypaisaNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isLocked', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AccountAppeal',
        index: 'AccountAppeal_createdAt_idx',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AccountAppeal',
        index: 'AccountAppeal_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AccountAppeal',
        index: 'AccountAppeal_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ActiveUserReward',
        index: 'ActiveUserReward_activeUserCount_idx',
        columns: ['activeUserCount'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ActiveUserReward',
        index: 'ActiveUserReward_periodStart_periodEnd_idx',
        columns: ['periodStart', 'periodEnd'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ActiveUserReward',
        index: 'ActiveUserReward_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AuditLog',
        index: 'AuditLog_action_idx',
        columns: ['action'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AuditLog',
        index: 'AuditLog_adminId_idx',
        columns: ['adminId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AuditLog',
        index: 'AuditLog_createdAt_idx',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AuditLog',
        index: 'AuditLog_targetUserId_idx',
        columns: ['targetUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_paymentMethod_transactionId_key',
        columns: ['paymentMethod', 'transactionId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_submittedAt_idx',
        columns: ['submittedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'EarningCollection',
        index: 'EarningCollection_collectedAt_idx',
        columns: ['collectedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'EarningCollection',
        index: 'EarningCollection_investmentId_idx',
        columns: ['investmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'EarningCollection',
        index: 'EarningCollection_transactionId_key',
        columns: ['transactionId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'EarningCollection',
        index: 'EarningCollection_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_nextCollectionAt_idx',
        columns: ['nextCollectionAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_planId_idx',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_userId_status_idx',
        columns: ['userId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'InvestmentPlan',
        index: 'InvestmentPlan_isSpecial_idx',
        columns: ['isSpecial'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'InvestmentPlan',
        index: 'InvestmentPlan_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_beneficiaryId_idx',
        columns: ['beneficiaryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_investmentId_idx',
        columns: ['investmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_level_idx',
        columns: ['level'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_sourceUserId_idx',
        columns: ['sourceUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_createdAt_idx',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_referenceId_idx',
        columns: ['referenceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_type_idx',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_email_key',
        columns: ['email'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_phone_idx',
        columns: ['phone'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_phone_key',
        columns: ['phone'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_publicUserId_key',
        columns: ['publicUserId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_referralCode_key',
        columns: ['referralCode'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_referredById_idx',
        columns: ['referredById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_requestedAt_idx',
        columns: ['requestedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_status_idx',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WithdrawalProfile',
        index: 'WithdrawalProfile_userId_key',
        columns: ['userId'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AccountAppeal',
        foreignKey: {
          name: 'AccountAppeal_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ActiveUserReward',
        foreignKey: {
          name: 'ActiveUserReward_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AuditLog',
        foreignKey: {
          name: 'AuditLog_adminId_fkey',
          columns: ['adminId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AuditLog',
        foreignKey: {
          name: 'AuditLog_targetUserId_fkey',
          columns: ['targetUserId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deposit',
        foreignKey: {
          name: 'Deposit_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'EarningCollection',
        foreignKey: {
          name: 'EarningCollection_investmentId_fkey',
          columns: ['investmentId'],
          references: { schema: 'public', table: 'Investment', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'EarningCollection',
        foreignKey: {
          name: 'EarningCollection_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Investment',
        foreignKey: {
          name: 'Investment_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Investment',
        foreignKey: {
          name: 'Investment_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'InvestmentPlan', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ReferralCommission',
        foreignKey: {
          name: 'ReferralCommission_beneficiaryId_fkey',
          columns: ['beneficiaryId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ReferralCommission',
        foreignKey: {
          name: 'ReferralCommission_investmentId_fkey',
          columns: ['investmentId'],
          references: { schema: 'public', table: 'Investment', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_depositId_fkey',
          columns: ['depositId'],
          references: { schema: 'public', table: 'Deposit', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_withdrawalId_fkey',
          columns: ['withdrawalId'],
          references: { schema: 'public', table: 'Withdrawal', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'User',
        foreignKey: {
          name: 'User_referredById_fkey',
          columns: ['referredById'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Withdrawal',
        foreignKey: {
          name: 'Withdrawal_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WithdrawalProfile',
        foreignKey: {
          name: 'WithdrawalProfile_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
